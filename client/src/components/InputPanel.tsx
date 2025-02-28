import React from 'react';
import { Trash2, FileCode, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CodeEditor from './CodeEditor';
import { sampleCodes } from '@/lib/sampleCode';

interface InputPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  onSubmit: () => void;
  model: string;
}

const InputPanel: React.FC<InputPanelProps> = ({
  inputText,
  setInputText,
  language,
  setLanguage,
  onSubmit,
  model
}) => {
  const clearInput = () => {
    setInputText('');
  };

  const loadSample = () => {
    const sampleCode = sampleCodes[model] || sampleCodes.default;
    setInputText(sampleCode);
    
    // Set appropriate language based on model
    if (model === 'codellama') {
      setLanguage('javascript');
    } else if (model === 'chatbot') {
      setLanguage('plaintext');
    } else {
      setLanguage('python');
    }
  };

  return (
    <div className="w-full lg:w-1/2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-base font-medium text-hf-text">Input</h3>
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="text-hf-slate hover:text-hf-accent text-sm"
              onClick={clearInput}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-hf-slate hover:text-hf-accent text-sm"
              onClick={loadSample}
            >
              <FileCode className="h-4 w-4 mr-1.5" />
              Load Sample
            </Button>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50">
          <CodeEditor 
            value={inputText}
            onChange={setInputText}
            language={language}
          />
          
          <div className="mt-2 flex justify-between items-center">
            <div>
              <select
                id="language-select"
                className="text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-hf-accent focus:border-hf-accent py-1"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="plaintext">Plain text</option>
              </select>
            </div>
            
            <Button 
              variant="default" 
              className="bg-hf-accent hover:bg-hf-accent/90"
              onClick={onSubmit}
            >
              <Send className="h-4 w-4 mr-1.5" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
