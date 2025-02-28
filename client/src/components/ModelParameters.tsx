import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ModelParams } from '@/lib/types';

interface ModelParametersProps {
  modelParams: ModelParams;
  updateModelParams: (key: string, value: number | string) => void;
}

const ModelParameters: React.FC<ModelParametersProps> = ({ 
  modelParams, 
  updateModelParams 
}) => {
  const [showParameters, setShowParameters] = useState(false);

  const toggleParametersVisibility = () => {
    setShowParameters(!showParameters);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-hf-text">Model Parameters</h3>
        <button 
          onClick={toggleParametersVisibility}
          className="text-hf-accent hover:text-hf-accent/80 text-sm font-medium flex items-center"
        >
          <span>{showParameters ? 'Hide Parameters' : 'Show Parameters'}</span>
          {showParameters ? (
            <ChevronUp className="ml-1 h-5 w-5" />
          ) : (
            <ChevronDown className="ml-1 h-5 w-5" />
          )}
        </button>
      </div>
      
      {showParameters && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-hf-text mb-1">Temperature</label>
            <div className="flex items-center">
              <input 
                type="range" 
                id="temperature" 
                min="0" 
                max="2" 
                step="0.1" 
                value={modelParams.temperature} 
                onChange={(e) => updateModelParams('temperature', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-hf-accent" 
              />
              <span className="ml-2 text-sm text-hf-slate min-w-[40px] text-right">
                {modelParams.temperature}
              </span>
            </div>
          </div>
          
          <div>
            <label htmlFor="max_tokens" className="block text-sm font-medium text-hf-text mb-1">Max Tokens</label>
            <div className="flex items-center">
              <input 
                type="range" 
                id="max_tokens" 
                min="1" 
                max="4096" 
                step="1" 
                value={modelParams.max_tokens} 
                onChange={(e) => updateModelParams('max_tokens', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-hf-accent" 
              />
              <span className="ml-2 text-sm text-hf-slate min-w-[40px] text-right">
                {modelParams.max_tokens}
              </span>
            </div>
          </div>
          
          <div>
            <label htmlFor="top_p" className="block text-sm font-medium text-hf-text mb-1">Top P</label>
            <div className="flex items-center">
              <input 
                type="range" 
                id="top_p" 
                min="0" 
                max="1" 
                step="0.01" 
                value={modelParams.top_p} 
                onChange={(e) => updateModelParams('top_p', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-hf-accent" 
              />
              <span className="ml-2 text-sm text-hf-slate min-w-[40px] text-right">
                {modelParams.top_p}
              </span>
            </div>
          </div>
          
          <div>
            <label htmlFor="frequency_penalty" className="block text-sm font-medium text-hf-text mb-1">Frequency Penalty</label>
            <div className="flex items-center">
              <input 
                type="range" 
                id="frequency_penalty" 
                min="0" 
                max="2" 
                step="0.1" 
                value={modelParams.frequency_penalty} 
                onChange={(e) => updateModelParams('frequency_penalty', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-hf-accent" 
              />
              <span className="ml-2 text-sm text-hf-slate min-w-[40px] text-right">
                {modelParams.frequency_penalty}
              </span>
            </div>
          </div>
          
          <div>
            <label htmlFor="presence_penalty" className="block text-sm font-medium text-hf-text mb-1">Presence Penalty</label>
            <div className="flex items-center">
              <input 
                type="range" 
                id="presence_penalty" 
                min="0" 
                max="2" 
                step="0.1" 
                value={modelParams.presence_penalty} 
                onChange={(e) => updateModelParams('presence_penalty', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-hf-accent" 
              />
              <span className="ml-2 text-sm text-hf-slate min-w-[40px] text-right">
                {modelParams.presence_penalty}
              </span>
            </div>
          </div>
          
          <div>
            <label htmlFor="stop_sequences" className="block text-sm font-medium text-hf-text mb-1">Stop Sequences</label>
            <input 
              type="text" 
              id="stop_sequences" 
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-hf-accent focus:border-hf-accent" 
              placeholder="Comma separated" 
              value={modelParams.stop_sequences}
              onChange={(e) => updateModelParams('stop_sequences', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelParameters;
