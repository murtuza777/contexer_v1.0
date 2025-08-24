import { excludeFiles } from "./utils/fileProcessor";

interface ParsedMessage {
    content: string;
    files?: Record<string, string>;
  }
  
  export function parseMessage(content: string): ParsedMessage {
    // Regular expression to match boltArtifact tags
    const artifactRegex = /<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/;
    
    // If content contains boltArtifact
    if (artifactRegex.test(content)) {
      // Remove boltArtifact part, replace with fixed text

      
      // Extract content from boltArtifact
      const match = content.match(artifactRegex);
      if (match) {
        const artifactContent = match[1].trim();
        
        // Parse file content
        const files: Record<string, string> = {};
        const boltActionRegex = /<boltAction type="file" filePath="([^"]+)">([\s\S]*?)<\/boltAction>/g;
        
        let boltMatch;
        while ((boltMatch = boltActionRegex.exec(artifactContent)) !== null) {
          const [_, filePath, fileContent] = boltMatch;
          if (!excludeFiles.includes(filePath)) {
            files[filePath] = fileContent.trim();
          }
        }
        
        const newContent = content.replace(artifactRegex, `Modified directory ${JSON.stringify(Object.keys(files))}`);
        return {
          content: newContent.trim(),
          files
        };
      }
    }
    
    // If no boltArtifact, return original content
    return {
      content
    };
  }