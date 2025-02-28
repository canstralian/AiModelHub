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

  const { 
    inference, 
    isLoading, 
    error, 
    timestamp, 
    responseTime, 
    reset 
  } = useModelInference();

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    
    await inference.mutateAsync({
      model: model === "custom" ? customModelUrl : model,
      apiKey,
      input: inputText,
      language,
      params: modelParams
    });
  };

  const updateModelParams = (key: string, value: number | string) => {
    setModelParams(prev => ({
      ...prev,
      [key]: value
    }));
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
            setModel={setModel} 
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
              result={inference.data}
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
