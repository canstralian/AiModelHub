import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-hf-yellow" viewBox="0 0 40 40" fill="currentColor">
                <path d="M14.4,25.6h-4V12h4V25.6z M25.6,14.4h-4v11.2h4V14.4z M20,14.4h-4v11.2h4V14.4z M36.8,12h-4v13.6h4V12z M31.2,12h-4v13.6h4V12z"/>
              </svg>
              <span className="ml-2 text-xl font-semibold">HF API Interface</span>
            </div>
          </div>
          <div className="flex items-center">
            <a href="https://huggingface.co/docs/api-inference/index" target="_blank" rel="noopener noreferrer" className="text-hf-text hover:text-hf-accent px-3 py-2 rounded-md text-sm font-medium">Documentation</a>
            <a href="https://github.com/huggingface/huggingface.js" target="_blank" rel="noopener noreferrer" className="ml-4 text-hf-text hover:text-hf-accent px-3 py-2 rounded-md text-sm font-medium">GitHub</a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
