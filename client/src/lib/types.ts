export interface ModelParams {
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  stop_sequences: string;
}

export interface ModelRequestParams {
  model: string;
  apiKey?: string;
  input: string;
  language: string;
  params: ModelParams;
}

export interface ApiResponse {
  output: string;
  model: string;
  timeTaken?: number;
}

export interface InferenceRequest {
  id: number;
  model: string;
  input: string;
  params: ModelParams;
  timestamp: Date;
  response?: string;
  error?: string;
  responseTime?: number;
}
