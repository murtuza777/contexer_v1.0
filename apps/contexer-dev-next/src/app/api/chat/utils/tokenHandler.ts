import { Messages, generateObjectFn } from "../action";
import { v4 as uuidv4 } from "uuid";

export async function handleTokenLimit(
  messages: Messages,
  files: { [key: string]: string },
  filesPath: string[]
): Promise<{ [key: string]: string }> {
  const fileMessage = JSON.parse(JSON.stringify(messages));
  const nowFiles: { [key: string]: string } = {};

  fileMessage.push({
    id: uuidv4(),
    role: "user",
    content: `Current file directory tree:\n${filesPath.join("\n")}\n\nIf the user's requirements need to modify files, please output the file paths according to the file directory tree format. For example, in the form of ['src/index.js','src/components/index.js','package.json'], extract file paths according to the relevance of the requirements. No need to output all paths, only output file paths related to user requirements.`,
  });

  const objectResult = await generateObjectFn(fileMessage);
  const nowPathFiles = objectResult.object.files;
  filesPath.forEach((path) => {
    if (nowPathFiles.includes(path)) {
      nowFiles[path] = files[path];
    }
  });

  return Object.keys(nowFiles).length > 0 ? nowFiles : files;
} 