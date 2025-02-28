import React, { useState } from 'react';
import { Eye, EyeOff, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ModelSelectorProps {
  model: string;
  setModel: (model: string) => void;
  apiKey: string;
  setApiKey: (apiKey: string) => void;
}

// Model categories and their attributes
interface ModelOption {
  value: string;
  label: string;
  isTool?: boolean;
  description?: string;
}

interface ModelCategory {
  name: string;
  models: ModelOption[];
}

const modelCategories: ModelCategory[] = [
  {
    name: "Code Generation",
    models: [
      { value: "deepseek-coder", label: "Deepseek Coder", description: "Specialized for code generation and completion" },
      { value: "codellama", label: "CodeLlama", description: "Meta's code-focused language model" },
      { value: "codestral-22b", label: "Codestral 22B v0.1", description: "Large language model optimized for code" },
      { value: "codeqwen-7b", label: "CodeQwen1.5 7B", description: "Efficient code generation model" },
      { value: "autocoder", label: "Autocoder", isTool: true, description: "Tool for automated code generation and completion" }
    ]
  },
  {
    name: "Code Analysis Tools",
    models: [
      { value: "python-reviewer", label: "Python Code Reviewer", isTool: true, description: "Identifies issues in Python code" },
      { value: "code-review-chains", label: "Code Review Chains", isTool: true, description: "Multi-step code analysis and improvement" },
      { value: "llama-cpp-agent", label: "Llama-CPP-Agent", isTool: true, description: "Specialized agent for code optimization" }
    ]
  },
  {
    name: "General Purpose",
    models: [
      { value: "chatbot", label: "General-purpose Chatbot", description: "For conversation and general queries" },
      { value: "custom", label: "Custom Model", description: "Use your own Hugging Face model" }
    ]
  }
];

// Helper function to find the model option for a given value
const findModelOption = (value: string): ModelOption | undefined => {
  for (const category of modelCategories) {
    const model = category.models.find(m => m.value === value);
    if (model) return model;
  }
  return undefined;
};

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

  // Get current model option
  const currentModel = findModelOption(model);

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-grow">
          <div className="flex items-center mb-1">
            <label htmlFor="model-select" className="block text-sm font-medium text-hf-text">Model</label>
            {currentModel?.isTool && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-800 border-amber-200 flex items-center">
                      <Wrench className="h-3 w-3 mr-1" />
                      Tool
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">This model functions as a tool with specialized capabilities for specific tasks</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="relative">
            <select 
              id="model-select" 
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-hf-accent focus:border-hf-accent rounded-md"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {modelCategories.map((category) => (
                <optgroup key={category.name} label={category.name}>
                  {category.models.map((modelOption) => (
                    <option key={modelOption.value} value={modelOption.value}>
                      {modelOption.label} {modelOption.isTool ? '🔧' : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          {currentModel?.description && (
            <p className="mt-1 text-xs text-gray-500">{currentModel.description}</p>
          )}
        </div>
        
        <div className="sm:w-64">
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
    </div>
  );
};

export default ModelSelector;
