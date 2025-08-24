import { useState } from "react";
import { FileContextMenu } from "./FileContextMenu";
import { FolderContextMenu } from "./FolderContextMenu";
import { InlineEdit } from "./InlineEdit";
import { CreateDialog } from "./CreateDialog";

import { FileItem } from "../types";
import {
  createFile,
  createFolder,
  renameFile,
  deleteFile,
} from "../utils/fileSystem";
import FileIcon from "./fileIcon";
import { cn } from "@/utils/cn";

// Custom SVG Icons
const ChevronRight = () => (
  <svg className="w-4 h-4 text-neon-green transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronDown = () => (
  <svg className="w-4 h-4 text-neon-green transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

interface FileTreeItemProps {
  item: FileItem;
  expanded: boolean;
  onToggle: (path: string, isExpend?: boolean) => void;
  onFileSelect: (path: string) => void;
  expandedFolders: Record<string, boolean>;
  selectedFile?: string;
}

export function FileTreeItem({
  item,
  expanded,
  onToggle,
  onFileSelect,
  expandedFolders,
  selectedFile,
}: FileTreeItemProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [createDialog, setCreateDialog] = useState<"file" | "folder" | null>(
    null
  );

  const isSelected = selectedFile === item.path;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === "folder") {
      onToggle(item.path);
    } else {
      onFileSelect(item.path);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    setContextMenu({ x: e.clientX - 410, y: e.clientY - 100 });
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCreateFile = async (name: string) => {
    const newPath = await createFile(item.path, name);
    onFileSelect(newPath);
  };

  const handleCreateFolder = (name: string) => {
    createFolder(item.path, name);
    onToggle(item.path, true);
  };

  const handleRename = (newName: string) => {
    if (newName && newName !== item.name) {
      renameFile(item.path, newName);
    }
    setIsRenaming(false);
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      deleteFile(item.path);
    }
    setContextMenu(null);
  };

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex items-center text-sm cursor-pointer rounded-lg transition-all duration-300",
          "h-8 px-3 my-1",
          "group relative select-none",
          isSelected 
            ? "bg-neon-green/20 text-neon-green border-2 border-neon-green/50 shadow-lg shadow-neon-green/25" 
            : "hover:bg-neon-green/10 hover:text-neon-cyan text-gray-300 border-2 border-transparent hover:border-neon-green/30"
        )}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        role="treeitem"
        tabIndex={0}
        aria-selected={isSelected}
        aria-expanded={item.type === "folder" ? expanded : undefined}
      >
        <span className="inline-flex items-center min-w-0 flex-1 gap-2">
          {item.type === "folder" && (
            <span className="w-5 h-5 flex items-center justify-center">
              {expanded ? (
                <ChevronDown />
              ) : (
                <ChevronRight />
              )}
            </span>
          )}
          <span className="w-5 h-5 flex items-center justify-center">
            <FileIcon fileName={item.name} />
          </span>
          {isRenaming ? (
            <InlineEdit
              value={item.name}
              onSubmit={handleRename}
              onCancel={() => setIsRenaming(false)}
            />
          ) : (
            <span className="truncate py-0.5 font-medium">{item.name}</span>
          )}
        </span>
      </div>

      {contextMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)}>
          {item.type === "file" ? (
            <FileContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              path={item.path}
              onClose={() => setContextMenu(null)}
              onRename={() => setIsRenaming(true)}
              onDelete={handleDelete}
            />
          ) : (
            <FolderContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              path={item.path}
              onClose={() => setContextMenu(null)}
              onRename={() => setIsRenaming(true)}
              onDelete={handleDelete}
              onCreateFile={() => setCreateDialog("file")}
              onCreateFolder={() => setCreateDialog("folder")}
            />
          )}
        </div>
      )}

      <CreateDialog
        type={createDialog || "file"}
        isOpen={createDialog !== null}
        path={item.path}
        onSubmit={
          createDialog === "file" ? handleCreateFile : handleCreateFolder
        }
        onClose={() => setCreateDialog(null)}
      />

      {expanded && item.type === "folder" && item.children && (
        <div
          className={cn(
            "flex flex-col pl-4 overflow-hidden",
            "transition-all duration-200"
          )}
        >
          {item.children.map((child) => (
            <FileTreeItem
              key={child.path}
              expandedFolders={expandedFolders}
              item={child}
              expanded={!!expandedFolders[child.path]}
              onToggle={onToggle}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
