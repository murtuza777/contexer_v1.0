import { FileTree } from './FileTree';
import { buildFileTree } from '../utils/fileTree';

interface FileListProps {
  files: any;
  onFileSelect: (path: string) => void;
}

export function FileList({ files, onFileSelect }: FileListProps) {
  const fileTree = buildFileTree(files.getFiles());
  
  return (
    <div className="px-3 py-2">
      <FileTree items={fileTree} onFileSelect={onFileSelect} />
    </div>
  );
}