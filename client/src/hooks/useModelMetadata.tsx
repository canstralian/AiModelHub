import { useMemo } from 'react';

export interface ModelOption {
  value: string;
  label: string;
  isTool: boolean;
  description: string;
  category: string;
  samplePrompt?: string;
}

export interface ModelCategory {
  name: string;
  description: string;
  models: ModelOption[];
}

/**
 * Hook that provides metadata about available models
 * including categorization and whether they're considered "tools"
 */
export function useModelMetadata() {
  const modelCategories = useMemo<ModelCategory[]>(() => [
    {
      name: "Code Generation",
      description: "Models specialized in generating code across various programming languages",
      models: [
        {
          value: "deepseek-coder",
          label: "DeepSeek Coder",
          category: "Code Generation",
          isTool: false,
          description: "Specialized in coding tasks with strong performance on code completion",
          samplePrompt: "Generate a React component that fetches and displays data from an API"
        },
        {
          value: "codellama",
          label: "CodeLlama 7B",
          category: "Code Generation",
          isTool: false,
          description: "Optimized for coding tasks with capabilities across multiple languages",
          samplePrompt: "Write a Python function to parse JSON data from a file"
        },
        {
          value: "autocoder",
          label: "Replit Code",
          category: "Code Generation",
          isTool: false,
          description: "Lightweight model trained on code completion tasks",
          samplePrompt: "Create a JavaScript utility function to format dates"
        },
        {
          value: "codestral-22b",
          label: "Codestral 22B",
          category: "Code Generation",
          isTool: false,
          description: "Large code model with enhanced capabilities for complex programming tasks",
          samplePrompt: "Implement a binary search tree in TypeScript with insert, search, and delete methods"
        },
        {
          value: "codeqwen-7b",
          label: "CodeQwen 7B",
          category: "Code Generation",
          isTool: false,
          description: "Multi-language code generation model optimized for completion tasks",
          samplePrompt: "Build a Flask API endpoint that queries a database"
        }
      ],
    },
    {
      name: "Code Analysis Tools",
      description: "Advanced models that analyze, review, and improve existing code",
      models: [
        {
          value: "python-reviewer",
          label: "Python Code Reviewer",
          category: "Code Analysis",
          isTool: true,
          description: "Specialized in reviewing and improving Python code quality",
          samplePrompt: "Review this Python code for errors and best practices:\n\ndef calculate_average(numbers):\n    total = 0\n    for num in numbers:\n        total += num\n    return total / len(numbers)"
        },
        {
          value: "code-review-chains",
          label: "Code Reviewer",
          category: "Code Analysis",
          isTool: true,
          description: "Analyzes code quality and suggests improvements across languages",
          samplePrompt: "Please review this JavaScript code:\n\nfunction fetchData() {\n  fetch('https://api.example.com/data')\n  .then(response => response.json())\n  .then(data => {\n    console.log(data);\n  })\n}"
        },
        {
          value: "llama-cpp-agent",
          label: "Code Agent",
          category: "Code Analysis",
          isTool: true,
          description: "Powerful tool for analyzing and improving complex code structures",
          samplePrompt: "Analyze this TypeScript code and suggest improvements:\n\nclass UserService {\n  private users: any[] = [];\n  \n  addUser(user: any) {\n    this.users.push(user);\n    return true;\n  }\n  \n  getUser(id: number) {\n    return this.users.find(u => u.id === id);\n  }\n}"
        }
      ],
    },
    {
      name: "General Purpose",
      description: "Versatile models suitable for various text generation tasks",
      models: [
        {
          value: "chatbot",
          label: "Mistral 7B",
          category: "General Purpose",
          isTool: false,
          description: "General-purpose language model for various text generation tasks",
          samplePrompt: "Explain the concept of RESTful APIs in simple terms"
        },
        {
          value: "custom",
          label: "Custom Model",
          category: "General Purpose",
          isTool: false,
          description: "Your own Hugging Face model (requires full model path)",
          samplePrompt: "Define your custom prompt based on the model you choose"
        }
      ],
    }
  ], []);

  // Flatten all models for easier lookup
  const allModels = useMemo(() => {
    return modelCategories.flatMap(category => category.models);
  }, [modelCategories]);

  // Function to get a specific model by its value
  const getModelByValue = (value: string): ModelOption | undefined => {
    return allModels.find(model => model.value === value);
  };

  // Function to check if a model is considered a "tool"
  const isModelTool = (value: string): boolean => {
    const model = getModelByValue(value);
    return model?.isTool || false;
  };

  // Get sample prompts for a specific model
  const getSamplePrompt = (value: string): string => {
    const model = getModelByValue(value);
    return model?.samplePrompt || '';
  };

  return {
    modelCategories,
    allModels,
    getModelByValue,
    isModelTool,
    getSamplePrompt
  };
}