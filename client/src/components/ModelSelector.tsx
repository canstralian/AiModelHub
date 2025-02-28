import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModelSelectorProps {
  model: string;
  setModel: (model: string) => void;
  apiKey: string;
  setApiKey: (apiKey: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  model, 
  setModel, 
  apiKey, 
  setApiKey 
}) => {
  const [showApiKey, setShowApiKey] = useState(false);

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-grow">
        <label htmlFor="model-select" className="block text-sm font-medium text-hf-text mb-1">Model</label>
        <div className="relative">
          <select 
            id="model-select" 
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-hf-accent focus:border-hf-accent rounded-md"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="deepseek-coder">Deepseek Coder</option>
            <option value="codellama">CodeLlama Playground</option>
            <option value="python-reviewer">AI Python Code Reviewer</option>
            <option value="chatbot">General-purpose Chatbot</option>
            <option value="custom">Custom Model</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div className="w-full sm:w-64">
        <label htmlFor="api-key-input" className="block text-sm font-medium text-hf-text mb-1">API Key (optional)</label>
        <div className="relative rounded-md shadow-sm">
          <input 
            type={showApiKey ? "text" : "password"} 
            id="api-key-input" 
            className="block w-full pr-10 py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-hf-accent focus:border-hf-accent" 
            placeholder="Enter API key" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <Button
              type="button" 
              variant="ghost"
              size="sm"
              className="h-full py-0 px-2"
              onClick={toggleApiKeyVisibility}
            >
              {showApiKey ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;
