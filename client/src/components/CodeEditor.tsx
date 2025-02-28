import React, { useRef, useEffect } from 'react';
import { useCodeEditor } from '@/hooks/useCodeEditor';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  
  const { highlightCode } = useCodeEditor({
    value,
    language,
    textareaRef,
    preRef,
  });

  useEffect(() => {
    highlightCode();
  }, [value, language, highlightCode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the inserted tab (2 spaces)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="relative border border-gray-300 rounded-md overflow-hidden">
      <pre 
        ref={preRef}
        className={`font-source-code text-sm px-4 py-3 bg-white overflow-y-auto h-80 language-${language}`}
      ></pre>
      <textarea 
        ref={textareaRef}
        className="absolute inset-0 font-source-code text-sm px-4 py-3 bg-transparent resize-none w-full h-full border-0 focus:ring-0 focus:outline-none text-transparent caret-black" 
        placeholder="// Type your code or prompt here..." 
        spellCheck="false"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      ></textarea>
    </div>
  );
};

export default CodeEditor;
