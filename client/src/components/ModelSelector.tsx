import React, { useState } from 'react';
import { Eye, EyeOff, Wrench, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useModelMetadata } from '@/hooks/useModelMetadata';

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
  const { modelCategories, getModelByValue } = useModelMetadata();

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  // Get current model option
  const currentModel = getModelByValue(model);

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
          {currentModel?.category && (
            <div className="mt-1 flex items-center">
              <Badge variant="secondary" className="text-xs">
                {currentModel.category}
              </Badge>
              {currentModel.samplePrompt && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 ml-1">
                        <Info className="h-3 w-3 text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start" className="max-w-sm">
                      <p className="font-semibold text-xs">Sample prompt:</p>
                      <p className="text-xs mt-1">{currentModel.samplePrompt}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
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
          <p className="mt-1 text-xs text-gray-500">
            {currentModel?.isTool ? 
              "API key required for tool models" : 
              "Optional for most models"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;