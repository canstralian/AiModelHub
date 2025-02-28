import { useCallback, useEffect, RefObject } from 'react';

interface CodeEditorHookProps {
  value: string;
  language: string;
  textareaRef: RefObject<HTMLTextAreaElement>;
  preRef: RefObject<HTMLPreElement>;
}

export function useCodeEditor({ 
  value, 
  language, 
  textareaRef, 
  preRef 
}: CodeEditorHookProps) {
  // Function to highlight the code
  const highlightCode = useCallback(() => {
    if (!preRef.current) return;
    
    // Escape HTML entities to prevent XSS
    const escapedCode = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    // Update the pre content
    preRef.current.textContent = escapedCode;
    
    // Apply syntax highlighting if a syntax highlighting library is available
    // and if language is not plaintext
    if (language !== 'plaintext' && 'hljs' in window) {
      // @ts-ignore
      window.hljs.highlightElement(preRef.current);
    }
  }, [value, language, preRef]);

  // Sync scroll positions between textarea and pre
  useEffect(() => {
    const textarea = textareaRef.current;
    const pre = preRef.current;
    
    if (!textarea || !pre) return;
    
    const syncScroll = () => {
      if (pre) {
        pre.scrollTop = textarea.scrollTop;
        pre.scrollLeft = textarea.scrollLeft;
      }
    };
    
    textarea.addEventListener('scroll', syncScroll);
    return () => textarea.removeEventListener('scroll', syncScroll);
  }, [textareaRef, preRef]);

  // Load hljs dynamically
  useEffect(() => {
    if (!('hljs' in window)) {
      // Load highlight.js
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js';
      script.async = true;
      
      script.onload = () => {
        // Load specific language definitions
        const languages = ['python', 'javascript', 'typescript'];
        
        Promise.all(languages.map(lang => {
          return new Promise((resolve) => {
            const langScript = document.createElement('script');
            langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/${lang}.min.js`;
            langScript.async = true;
            langScript.onload = resolve;
            document.body.appendChild(langScript);
          });
        })).then(() => {
          // @ts-ignore
          if (window.hljs) window.hljs.highlightAll();
          highlightCode();
        });
      };
      
      document.body.appendChild(script);
    }
  }, [highlightCode]);

  return { highlightCode };
}
