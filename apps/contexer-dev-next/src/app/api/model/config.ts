// Model configuration file
// Configure models based on actual scenarios

interface ModelConfig {
    modelName: string;
    modelKey: string;
    useImage: boolean;
    description?: string;
    iconUrl?: string;
    provider?: string; // Model provider
    apiKey?: string;
    apiUrl?: string;
    functionCall: boolean;
}

export const modelConfig: ModelConfig[] = [
    {
        modelName: 'claude-3-5-sonnet',
        modelKey: 'claude-3-5-sonnet-20240620',
        useImage: true,
        provider: 'claude',
        description: 'Claude 3.5 Sonnet model',
        functionCall: true,
        apiKey: process.env.CLAUDE_API_KEY || process.env.THIRD_API_KEY,
        apiUrl: process.env.CLAUDE_API_URL || process.env.THIRD_API_URL,
    },
    {
        modelName: 'gpt-4o-mini',
        modelKey: 'gpt-4o-mini',
        useImage: false,
        provider: 'openai',
        description: 'GPT-4 Optimized Mini model',
        functionCall: true,
        apiKey: process.env.OPENAI_API_KEY || process.env.THIRD_API_KEY,
        apiUrl: process.env.OPENAI_API_URL || process.env.THIRD_API_URL,
    },
    {
        modelName: 'deepseek-R1',
        modelKey: 'deepseek-reasoner',
        useImage: false,
        provider: 'deepseek',
        description: 'Deepseek R1 model with reasoning and chain-of-thought capabilities',
        functionCall: false,
        apiKey: process.env.DEEPSEEK_API_KEY || process.env.THIRD_API_KEY,
        apiUrl: process.env.DEEPSEEK_API_URL || process.env.THIRD_API_URL,
    },
    {
        modelName: 'deepseek-v3',
        modelKey: 'deepseek-chat',
        useImage: false,
        provider: 'deepseek',
        description: 'Deepseek V3 model',
        functionCall: true,
        apiKey: process.env.DEEPSEEK_API_KEY || process.env.THIRD_API_KEY,
        apiUrl: process.env.DEEPSEEK_API_URL || process.env.THIRD_API_URL,
    },
    {
        modelName: 'gpt-oss-120b',
        modelKey: 'openai/gpt-oss-120b',
        useImage: false,
        provider: 'openrouter',
        description: 'OpenAI OSS 120B model with powerful reasoning capabilities',
        functionCall: true,
        apiKey: process.env.OPENROUTER_API_KEY || process.env.THIRD_API_KEY,
        apiUrl: process.env.OPENROUTER_API_URL || process.env.THIRD_API_URL,
    },
    {
        modelName: 'gpt-oss-20b',
        modelKey: 'openai/gpt-oss-20b',
        useImage: false,
        provider: 'openrouter',
        description: 'OpenAI OSS 20B model for faster responses',
        functionCall: true,
        apiKey: process.env.OPENROUTER_API_KEY || process.env.THIRD_API_KEY,
        apiUrl: process.env.OPENROUTER_API_URL || process.env.THIRD_API_URL,
    }
]
