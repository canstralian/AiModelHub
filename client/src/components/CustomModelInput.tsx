import React from 'react';

interface CustomModelInputProps {
  customModelUrl: string;
  setCustomModelUrl: (url: string) => void;
}

const CustomModelInput: React.FC<CustomModelInputProps> = ({ 
  customModelUrl, 
  setCustomModelUrl 
}) => {
  return (
    <div className="mb-6">
      <label htmlFor="custom-model-url" className="block text-sm font-medium text-hf-text mb-1">Custom Model URL</label>
      <div className="flex">
        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
          https://huggingface.co/spaces/
        </span>
        <input 
          type="text" 
          id="custom-model-url" 
          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-hf-accent focus:border-hf-accent border border-gray-300" 
          placeholder="username/model-name" 
          value={customModelUrl}
          onChange={(e) => setCustomModelUrl(e.target.value)}
        />
      </div>
    </div>
  );
};

export default CustomModelInput;
