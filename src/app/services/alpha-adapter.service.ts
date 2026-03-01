import { Injectable, signal, computed } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export interface MarketData {
  timestamp: Date;
  price: number;
  sentiment: number;
  forecast?: number;
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

  async askAgent(prompt: string) {
    const model = "gemini-3.1-pro-preview";
    const adapter = this.activeAdapter();
    
    const systemInstruction = `
      You are Alpha-Adapter, a high-performance financial sentiment and forecasting engine.
      Current Active Adapter: ${adapter?.name} (${adapter?.sector} focus).
      You use Model Context Protocol (MCP) to maintain state across market cycles.
      Your tone is professional, analytical, and data-driven.
      When discussing market data, refer to the current price trends and sentiment scores.
      Current Price: ${this.marketData().slice(-1)[0].price.toFixed(2)}
      Current Sentiment: ${this.marketData().slice(-1)[0].sentiment.toFixed(1)}%
      
      Maintain a "Portfolio State" for the user. If they mention assets, remember them.
    `;

    try {
      const chat = this.ai.chats.create({
        model,
        config: {
          systemInstruction,
        }
      });

      // We simulate history by sending messages
      // In a real app, we'd use the history array properly
      const response: GenerateContentResponse = await chat.sendMessage({ message: prompt });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Error connecting to Alpha-Adapter core. Please check your connection.";
    }
  }
}
