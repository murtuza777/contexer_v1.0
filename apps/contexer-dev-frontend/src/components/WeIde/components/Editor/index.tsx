import { useFileStore } from "../../stores/fileStore";
import { useEditorStore } from "../../stores/editorStore";
import { useEditorSetup } from "./hooks/useEditorSetup";
import { useEditorScroll } from "./hooks/useEditorScroll";
import "./styles/diff.css";
import { useRef } from "react";

interface EditorProps {
  fileName: string;
  initialLine?: number;
}

export const Editor = ({ fileName, initialLine }: EditorProps) => {
  const { getContent } = useFileStore();
  const { setDirty, setCurrentFile } = useEditorStore();

  const rawContent = getContent(fileName);

  const handleDocChange = () => {
    setCurrentFile(fileName);
    setDirty(fileName, true);
  };

  const { editorRef, viewRef } = useEditorSetup({
    fileName,
    fileContent: rawContent,
    onDocChange: handleDocChange,
  });

  useEditorScroll({
    view: viewRef.current,
    fileContent: rawContent,
  });

  return (
    <div
      ref={editorRef}
      className={`
        editor-container h-full w-full overflow-hidden
        [&_.cm-editor]:!bg-dark-bg [&_.cm-editor]:dark:!bg-darker-bg
        [&_.cm-scroller]:!font-mono
        /* Line numbers and sidebar area */
        [&_.cm-gutters]:!bg-card-bg [&_.cm-gutters]:dark:!bg-card-bg
        [&_.cm-gutters]:border-r-2 [&_.cm-gutters]:border-neon-green/20 [&_.cm-gutters]:dark:border-neon-green/20
        [&_.cm-lineNumbers]:!text-neon-cyan [&_.cm-lineNumbers]:dark:!text-neon-cyan
        [&_.cm-gutterElement]:pl-[12px] [&_.cm-gutterElement]:min-w-[45px]
        
        /* Active line highlight */
        [&_.cm-activeLine]:!bg-neon-green/5 [&_.cm-activeLine]:dark:!bg-neon-green/5
        [&_.cm-activeLineGutter]:!bg-neon-green/10 [&_.cm-activeLineGutter]:dark:!bg-neon-green/10
        
        /* Selection and search */
        [&_.cm-selectionBackground]:!bg-neon-blue/20 [&_.cm-selectionBackground]:dark:!bg-neon-blue/20
        [&_.cm-selectionMatch]:!bg-neon-green/20 [&_.cm-selectionMatch]:dark:!bg-neon-green/20
        [&_.cm-searchMatch]:!bg-neon-cyan/30 [&_.cm-searchMatch]:dark:!bg-neon-cyan/30
        [&_.cm-searchMatch-selected]:!bg-neon-green/40
        
        /* Basic text and cursor */
        [&_.cm-cursor]:!border-l-[2px] [&_.cm-cursor]:!border-l-solid [&_.cm-cursor]:!border-l-neon-green [&_.cm-cursor]:dark:!border-l-neon-green
        
        /* Special elements */
        [&_.cm-matchingBracket]:!bg-neon-green/20 [&_.cm-matchingBracket]:dark:!bg-neon-green/20
        [&_.cm-matchingBracket]:!border-neon-green
        [&_.cm-nonmatchingBracket]:!border-neon-red
        [&_.cm-foldPlaceholder]:!bg-card-bg [&_.cm-foldPlaceholder]:dark:!bg-card-bg
        [&_.cm-tooltip]:!bg-card-bg [&_.cm-tooltip]:dark:!bg-card-bg
        [&_.cm-tooltip]:border-2 [&_.cm-tooltip]:border-neon-green/30 [&_.cm-tooltip]:dark:border-neon-green/30
        
        /* Syntax highlighting base styles */
        [&_.cm-line]:!text-white [&_.cm-line]:dark:!text-white
      `}
      role="textbox"
      aria-label={`Code editor for ${fileName}`}
      tabIndex={0}
    />
  );
};
