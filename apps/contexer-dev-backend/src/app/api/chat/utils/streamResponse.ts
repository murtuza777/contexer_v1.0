import {v4 as uuidv4} from "uuid";
import {Messages, StreamingOptions, streamTextFn} from "../action";
import {CONTINUE_PROMPT, ToolInfo} from "../prompt";
import {deductUserTokens, estimateTokens} from "@/utils/tokens";
import SwitchableStream from "../switchable-stream";
import {tool} from "ai";
import {jsonSchemaToZodSchema} from "@/app/api/chat/utils/json2zod";

const MAX_RESPONSE_SEGMENTS = 2;

export async function streamResponse(
    messages: Messages,
    model: string,
    userId: string | null,
    tools?: ToolInfo[]
): Promise<Response> {
    let toolList = {};
    if (tools && tools.length > 0) {
        toolList = tools.reduce((obj, {name, ...args}) => {
            obj[name] = tool({
                id: args.id,
                description: args.description,
                parameters:  jsonSchemaToZodSchema(args.parameters)
            });
            return obj;
        }, {});
    }
    const stream = new SwitchableStream();
    const options: StreamingOptions = {
        tools: toolList,
        toolCallStreaming: true,
        onError: (err: any) => {
            console.error('AI API Error:', err);
            
            // Get error information, prioritize cause property
            const errorCause = err?.cause?.message || err?.cause || err?.error?.message;
            let msg = errorCause || err?.errors?.[0]?.responseBody || err?.message || JSON.stringify(err);
            
            // Add specific error messages for common issues
            if (msg.includes('timeout') || msg.includes('ETIMEDOUT') || msg.includes('Connect Timeout')) {
                msg = 'API request timed out. Please check your API endpoint configuration and network connection.';
            } else if (msg.includes('401') || msg.includes('unauthorized')) {
                msg = 'Invalid API key. Please check your API key configuration.';
            } else if (msg.includes('404')) {
                msg = 'API endpoint not found. Please check your API URL configuration.';
            } else if (msg.includes('rate limit') || msg.includes('429')) {
                msg = 'API rate limit exceeded. Please try again later.';
            }
            
            const error = new Error(`AI API Error: ${msg}`);
            error.cause = msg;
            throw error;
        },
        onFinish: async (response) => {
            const {text: content, finishReason} = response;

            if (finishReason !== "length") {
                const tokens = estimateTokens(content);
                if (userId) {
                    await deductUserTokens(userId, tokens);
                }
                return stream.close();
            }

            if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
                throw Error("Cannot continue message: Maximum segments reached");
            }

            messages.push({id: uuidv4(), role: "assistant", content});
            messages.push({id: uuidv4(), role: "user", content: CONTINUE_PROMPT});
        },
    };

    try {
        const result = streamTextFn(messages, options, model);
        return result.toDataStreamResponse({
            sendReasoning: true,
        });
    } catch (error: any) {
        // Ensure stream is closed
        stream.close();
        // If error contains cause, throw it as new error
        if (error.cause) {
            const newError = new Error(error.cause);
            newError.cause = error.cause;
            throw newError;
        }
        stream.close();
        throw error;
    }
}