import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModelSelector from "@/components/ModelSelector";
import CustomModelInput from "@/components/CustomModelInput";
import ModelParameters from "@/components/ModelParameters";
import InputPanel from "@/components/InputPanel";
import OutputPanel from "@/components/OutputPanel";
import { useState } from "react";
import { ModelParams } from "@/lib/types";
import { useModelInference } from "@/hooks/useModelInference";
import { useModelMetadata } from "@/hooks/useModelMetadata";

export default function Home() {
  const [model, setModel] = useState("deepseek-coder");
  const [apiKey, setApiKey] = useState("");
  const [customModelUrl, setCustomModelUrl] = useState("");
  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState("python");
  const [modelParams, setModelParams] = useState<ModelParams>({
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 0.9,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop_sequences: "",
  });

  const { getModelByValue } = useModelMetadata();
  const { 
    inference, 
    isLoading, 
    error, 
    timestamp, 
    responseTime, 
    reset,
    retryCount
  } = useModelInference();

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    
    // Get the current model
    const currentModel = getModelByValue(model);
    const modelIdentifier = model === "custom" ? customModelUrl : model;
    
    // Set default temperature based on model type
    let tempParams = {...modelParams};
    if (currentModel?.isTool && tempParams.temperature > 0.5) {
      // Tool models typically work better with lower temperature
      tempParams.temperature = 0.2;
    }
    
    await inference.mutateAsync({
      model: modelIdentifier,
      apiKey,
      input: inputText,
      language,
      params: tempParams
    });
  };

  const updateModelParams = (key: string, value: number | string) => {
    setModelParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // When changing model, adjust parameters if needed
  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    
    // Reset api key when switching to/from custom model
    if (newModel === "custom" || model === "custom") {
      setApiKey("");
    }
    
    // Set optimal default parameters based on model type
    const selectedModel = getModelByValue(newModel);
    if (selectedModel?.isTool) {
      // Tool models typically work better with these parameters
      setModelParams(prev => ({
        ...prev,
        temperature: 0.2,
        top_p: 0.95,
        max_tokens: 2048, // Tools might need more tokens for analysis
      }));
    } else if (newModel === "chatbot") {
      // Chatbot models typically work well with these parameters
      setModelParams(prev => ({
        ...prev,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1024,
      }));
    } else {
      // Code models typically work better with lower temperature
      setModelParams(prev => ({
        ...prev,
        temperature: 0.5,
        top_p: 0.95,
        max_tokens: 1024,
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="bg-white">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-hf-text">Hugging Face Model Inference</h1>
            <p className="text-hf-slate mt-1">Run AI models with our simplified API interface for Hugging Face Spaces</p>
          </div>

          <ModelSelector 
            model={model} 
            setModel={handleModelChange}
            apiKey={apiKey} 
            setApiKey={setApiKey} 
          />

          {model === "custom" && (
            <CustomModelInput 
              customModelUrl={customModelUrl} 
              setCustomModelUrl={setCustomModelUrl} 
            />
          )}

          <ModelParameters 
            modelParams={modelParams}
            updateModelParams={updateModelParams}
          />

          <div className="flex flex-col lg:flex-row gap-6">
            <InputPanel 
              inputText={inputText}
              setInputText={setInputText}
              language={language}
              setLanguage={setLanguage}
              onSubmit={handleSubmit}
              model={model}
            />

            <OutputPanel 
              result={typeof inference.data === 'string' ? inference.data : null}
              isLoading={isLoading}
              error={error}
              timestamp={timestamp}
              responseTime={responseTime}
              reset={reset}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
