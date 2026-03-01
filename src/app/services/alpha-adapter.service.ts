import { Injectable, signal, computed } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

export interface MarketData {
  timestamp: Date;
  price: number;
  sentiment: number;
  forecast?: number;
}

export interface AgentInsight {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

export interface AgentResponse {
  summary: string;
  insights: AgentInsight[];
  recommendation?: {
    action: 'BUY' | 'SELL' | 'HOLD' | 'WATCH';
    confidence: number;
    reason: string;
  };
}

export interface AdapterState {
  id: string;
  name: string;
  sector: string;
  accuracy: number;
  latency: number;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlphaAdapterService {
  private _ai: GoogleGenAI | null = null;
  
  private get ai(): GoogleGenAI {
    if (!this._ai) {
      const apiKey = typeof window !== 'undefined' ? (window as { GEMINI_API_KEY?: string }).GEMINI_API_KEY || '' : '';
      if (!apiKey) {
        console.warn('GEMINI_API_KEY not found. Some features may be disabled.');
      }
      this._ai = new GoogleGenAI({ apiKey });
    }
    return this._ai;
  }
  
  // State
  marketData = signal<MarketData[]>([]);
  adapters = signal<AdapterState[]>([
    { id: 'lora-tech-01', name: 'Tech-Alpha', sector: 'Technology', accuracy: 0.94, latency: 42, active: true },
    { id: 'lora-fin-02', name: 'Fin-Nuance', sector: 'Financials', accuracy: 0.91, latency: 38, active: false },
    { id: 'lora-en-03', name: 'Energy-Flow', sector: 'Energy', accuracy: 0.89, latency: 45, active: false },
    { id: 'lora-hc-04', name: 'Bio-Pulse', sector: 'Healthcare', accuracy: 0.92, latency: 51, active: false }
  ]);

  activeAdapter = computed(() => this.adapters().find(a => a.active));

  constructor() {
    this.generateMockData();
  }

  private generateMockData() {
    const data: MarketData[] = [];
    let currentPrice = 150;
    const now = new Date();

    for (let i = 60; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      currentPrice += (Math.random() - 0.5) * 2;
      data.push({
        timestamp: time,
        price: currentPrice,
        sentiment: Math.random() * 100
      });
    }
    this.marketData.set(data);
  }

  switchAdapter(id: string) {
    this.adapters.update(list => list.map(a => ({
      ...a,
      active: a.id === id
    })));
  }

  async askAgent(prompt: string): Promise<AgentResponse | string> {
    const model = "gemini-3.1-pro-preview";
    const adapter = this.activeAdapter();
    
    const systemInstruction = `
      You are Alpha-Adapter, a high-performance financial sentiment and forecasting engine.
      Current Active Adapter: ${adapter?.name} (${adapter?.sector} focus).
      You use Model Context Protocol (MCP) to maintain state across market cycles.
      Your tone is professional, analytical, and data-driven.
      
      Current Market Context:
      - Price: ${this.marketData().slice(-1)[0].price.toFixed(2)}
      - Sentiment: ${this.marketData().slice(-1)[0].sentiment.toFixed(1)}%
      
      You MUST respond with a structured JSON object. 
      - summary: A concise 1-2 sentence overview.
      - insights: 2-4 specific data points (e.g., "RSI", "Volume Delta", "Sector Flow").
      - recommendation: (Optional) A clear action if the data supports it.
      
      Icons should be Material Icon names (e.g., 'trending_up', 'show_chart', 'account_balance').
    `;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              insights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.STRING },
                    trend: { type: Type.STRING, enum: ['up', 'down', 'neutral'] },
                    icon: { type: Type.STRING }
                  },
                  required: ['label', 'value', 'trend', 'icon']
                }
              },
              recommendation: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING, enum: ['BUY', 'SELL', 'HOLD', 'WATCH'] },
                  confidence: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                },
                required: ['action', 'confidence', 'reason']
              }
            },
            required: ['summary', 'insights']
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response");
      return JSON.parse(text) as AgentResponse;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Error connecting to Alpha-Adapter core. Please check your connection.";
    }
  }
}
