import React, { useRef } from 'react';
import { Copy, Download, AlertCircle, RotateCcw, Key, Hourglass, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface OutputPanelProps {
  result: string | null;
  isLoading: boolean;
  error: Error | null;
  timestamp: string | null;
  responseTime: number | null;
  reset: () => void;
}

// Helper to determine error type and return appropriate icon and color
const getErrorDetails = (errorMessage: string) => {
  if (!errorMessage) {
    return {
      icon: AlertCircle,
      title: 'Error',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    };
  }
  
  if (errorMessage.includes('API key') || errorMessage.includes('Authentication')) {
    return {
      icon: Key,
      title: 'Authentication Error',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    };
  }
  
  if (errorMessage.includes('exceeded') || errorMessage.includes('quota')) {
    return {
      icon: Zap,
      title: 'API Limit Reached',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    };
  }
  
  if (errorMessage.includes('loading') || errorMessage.includes('try again')) {
    return {
      icon: Hourglass,
      title: 'Model Loading',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    };
  }
  
  // Default error style
  return {
    icon: AlertCircle,
    title: 'Error',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  };
};

const OutputPanel: React.FC<OutputPanelProps> = ({
  result,
  isLoading,
  error,
  timestamp,
  responseTime,
  reset
}) => {
  const { toast } = useToast();
  const outputRef = useRef<HTMLPreElement>(null);

  const copyOutput = () => {
    if (result && navigator.clipboard) {
      navigator.clipboard.writeText(result)
        .then(() => {
          toast({
            title: "Copied!",
            description: "Output copied to clipboard",
            duration: 2000,
          });
        })
        .catch(() => {
          toast({
            title: "Failed to copy",
            description: "Could not copy text to clipboard",
            variant: "destructive",
          });
        });
    }
  };

  const downloadOutput = () => {
    if (result) {
      const blob = new Blob([result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `huggingface-output-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const retryRequest = () => {
    reset();
  };

  // Get error-specific styling
  const errorDetails = error 
    ? getErrorDetails(error.message) 
    : { icon: AlertCircle, title: 'Error', color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  
  const ErrorIcon = errorDetails.icon;

  return (
    <div className="w-full lg:w-1/2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-base font-medium text-hf-text">Output</h3>
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="text-hf-slate hover:text-hf-accent text-sm"
              onClick={copyOutput}
              disabled={!result || isLoading}
            >
              <Copy className="h-4 w-4 mr-1.5" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-hf-slate hover:text-hf-accent text-sm"
              onClick={downloadOutput}
              disabled={!result || isLoading}
            >
              <Download className="h-4 w-4 mr-1.5" />
              Download
            </Button>
          </div>
        </div>
        
        <div className="p-4 font-source-code bg-white">
          {isLoading && (
            <div className="flex items-center justify-center h-80">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-hf-accent border-r-transparent"></div>
                <p className="mt-3 text-hf-slate">Processing your request...</p>
                <p className="text-xs text-gray-500 mt-2 max-w-md">
                  This can take 10-30 seconds for larger models. 
                  Models are loaded on-demand by Hugging Face.
                </p>
              </div>
            </div>
          )}
          
          {error && !isLoading && (
            <div className="flex items-center justify-center h-80">
              <div className="text-center w-full max-w-md">
                <Alert className={`${errorDetails.bgColor} ${errorDetails.borderColor} border mb-4`}>
                  <ErrorIcon className={`h-5 w-5 ${errorDetails.color}`} />
                  <AlertTitle className={`${errorDetails.color} font-medium`}>{errorDetails.title}</AlertTitle>
                  <AlertDescription className="text-gray-700">
                    {error.message || "An error occurred while processing your request."}
                  </AlertDescription>
                </Alert>
                
                {errorDetails.title === 'API Limit Reached' && (
                  <div className="text-sm text-gray-600 mt-3 text-left p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h4 className="font-medium mb-2">Suggestions:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Add your own Hugging Face API key in the form above</li>
                      <li>Try a different model from the dropdown</li>
                      <li>Wait a few minutes and try again</li>
                    </ul>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  className="mt-4 text-hf-accent border-hf-accent hover:bg-hf-accent/10"
                  onClick={retryRequest}
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Retry
                </Button>
              </div>
            </div>
          )}
          
          {result && !isLoading && !error && (
            <div className="h-80 overflow-y-auto">
              <pre 
                ref={outputRef}
                className="text-sm p-4 rounded-md bg-gray-50 overflow-x-auto whitespace-pre-wrap"
              >
                {result}
              </pre>
            </div>
          )}
          
          {!result && !isLoading && !error && (
            <div className="flex items-center justify-center h-80">
              <div className="text-center text-hf-slate">
                <svg className="h-10 w-10 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                </svg>
                <p className="mt-3">Send a request to see results here</p>
              </div>
            </div>
          )}
        </div>
        
        {(timestamp || responseTime) && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-hf-slate">
            <div className="flex justify-between">
              {timestamp && (
                <span>Last request: {timestamp}</span>
              )}
              {responseTime && (
                <span>Response time: {responseTime.toFixed(2)}s</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
