import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlphaAdapterService, AgentResponse } from '../../services/alpha-adapter.service';

interface Message {
  role: 'user' | 'assistant';
  content: string | AgentResponse;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full bg-finance-card border border-finance-border rounded-xl overflow-hidden">
      <!-- Header -->
      <div class="p-4 border-b border-finance-border flex justify-between items-center bg-finance-card/50 backdrop-blur-sm">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-finance-accent animate-pulse"></div>
          <h3 class="text-xs font-mono uppercase tracking-widest">Alpha-Adapter Agent</h3>
        </div>
        <span class="text-[10px] font-mono text-finance-muted">MCP STATE: ACTIVE</span>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-6 font-sans text-sm">
        @for (msg of messages(); track msg.timestamp) {
          <div class="flex flex-col" [class.items-end]="msg.role === 'user'">
            
            <!-- User Message -->
            @if (msg.role === 'user') {
              <div class="max-w-[85%] p-3 rounded-lg leading-relaxed bg-finance-accent/10 border border-finance-accent/20 text-finance-accent">
                {{ msg.content }}
              </div>
            }

            <!-- Assistant Message (Structured) -->
            @if (msg.role === 'assistant') {
              <div class="max-w-[95%] w-full space-y-3">
                @if (isString(msg.content)) {
                  <div class="p-3 rounded-lg bg-finance-border/30 border border-finance-border text-finance-text">
                    {{ msg.content }}
                  </div>
                } @else {
                  <!-- Summary -->
                  <div class="p-3 rounded-lg bg-finance-border/30 border border-finance-border text-finance-text leading-relaxed">
                    {{ asAgentResponse(msg.content).summary }}
                  </div>

                  <!-- Insights Grid -->
                  <div class="grid grid-cols-2 gap-2">
                    @for (insight of asAgentResponse(msg.content).insights; track insight.label) {
                      <div class="p-2 rounded-lg bg-finance-bg border border-finance-border flex flex-col gap-1">
                        <div class="flex justify-between items-center">
                          <span class="text-[10px] font-mono text-finance-muted uppercase">{{ insight.label }}</span>
                          <span class="material-icons text-xs" 
                                [ngClass]="{
                                  'text-finance-accent': insight.trend === 'up',
                                  'text-red-500': insight.trend === 'down',
                                  'text-finance-muted': insight.trend === 'neutral'
                                }">{{ insight.icon }}</span>
                        </div>
                        <span class="text-xs font-bold font-mono">{{ insight.value }}</span>
                      </div>
                    }
                  </div>

                  <!-- Recommendation -->
                  @if (asAgentResponse(msg.content).recommendation; as rec) {
                    <div class="p-3 rounded-lg border flex flex-col gap-2"
                         [ngClass]="{
                           'bg-finance-accent/5 border-finance-accent/30': rec.action === 'BUY',
                           'bg-red-500/5 border-red-500/30': rec.action === 'SELL',
                           'bg-finance-border/30 border-finance-border': rec.action === 'HOLD' || rec.action === 'WATCH'
                         }">
                      <div class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                          <span class="text-[10px] font-mono uppercase tracking-widest opacity-70">Recommendation</span>
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono"
                                [ngClass]="{
                                  'bg-finance-accent text-finance-bg': rec.action === 'BUY',
                                  'bg-red-500 text-white': rec.action === 'SELL',
                                  'bg-finance-muted text-white': rec.action === 'HOLD' || rec.action === 'WATCH'
                                }">{{ rec.action }}</span>
                        </div>
                        <span class="text-[10px] font-mono opacity-60">Conf: {{ rec.confidence * 100 }}%</span>
                      </div>
                      <p class="text-[11px] leading-tight opacity-90">{{ rec.reason }}</p>
                    </div>
                  }
                }
              </div>
            }

            <span class="text-[10px] font-mono text-finance-muted mt-1 px-1">
              {{ msg.role === 'assistant' ? 'ALPHA-ADAPTER' : 'USER' }} • {{ msg.timestamp | date:'HH:mm:ss' }}
            </span>
          </div>
        }
        
        @if (isTyping()) {
          <div class="flex flex-col items-start gap-1">
            <div class="bg-finance-border/30 border border-finance-border p-3 rounded-lg flex items-center gap-3">
              <div class="flex gap-1">
                <div class="w-1.5 h-1.5 bg-finance-accent rounded-full animate-bounce [animation-duration:0.8s]"></div>
                <div class="w-1.5 h-1.5 bg-finance-accent rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
                <div class="w-1.5 h-1.5 bg-finance-accent rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></div>
              </div>
              <span class="text-[10px] font-mono text-finance-muted uppercase tracking-widest">Processing Weights...</span>
            </div>
          </div>
        }
      </div>

      <!-- Input -->
      <div class="p-4 border-t border-finance-border bg-finance-card/50">
        <form (submit)="sendMessage($event)" class="relative">
          <input 
            type="text" 
            [(ngModel)]="userInput" 
            name="userInput"
            placeholder="Query market sentiment or forecast..."
            class="w-full bg-finance-bg border border-finance-border rounded-lg py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-finance-accent transition-colors font-sans"
            [disabled]="isTyping()"
          />
          <button 
            type="submit"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-finance-muted hover:text-finance-accent transition-colors"
            [disabled]="!userInput.trim() || isTyping()"
          >
            <span class="material-icons text-lg">send</span>
          </button>
        </form>
      </div>
    </div>
  `
})
export class ChatPanelComponent {
  private service = inject(AlphaAdapterService);
  
  messages = signal<Message[]>([
    { 
      role: 'assistant', 
      content: 'Alpha-Adapter initialized. LoRA weights loaded for tech sector. How can I assist with your portfolio analysis today?', 
      timestamp: new Date() 
    }
  ]);
  userInput = '';
  isTyping = signal(false);

  isString(val: string | AgentResponse): val is string {
    return typeof val === 'string';
  }

  asAgentResponse(val: string | AgentResponse): AgentResponse {
    return val as AgentResponse;
  }

  async sendMessage(event: Event) {
    event.preventDefault();
    if (!this.userInput.trim() || this.isTyping()) return;

    const userMsg = this.userInput;
    this.userInput = '';
    
    this.messages.update(prev => [...prev, {
      role: 'user',
      content: userMsg,
      timestamp: new Date()
    }]);

    this.isTyping.set(true);
    
    const response = await this.service.askAgent(userMsg);
    
    this.messages.update(prev => [...prev, {
      role: 'assistant',
      content: response || 'No response from engine.',
      timestamp: new Date()
    }]);
    
    this.isTyping.set(false);
  }
}
