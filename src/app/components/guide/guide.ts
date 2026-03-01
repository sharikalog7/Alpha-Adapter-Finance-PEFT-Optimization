import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-finance-bg/80 backdrop-blur-sm">
      <div class="bg-finance-card border border-finance-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <!-- Header -->
        <div class="p-6 border-b border-finance-border flex justify-between items-center sticky top-0 bg-finance-card z-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-finance-accent rounded-lg flex items-center justify-center">
              <span class="material-icons text-finance-bg font-bold">help_outline</span>
            </div>
            <div>
              <h2 class="text-xl font-bold tracking-tight">Alpha-Adapter Guide</h2>
              <p class="text-xs font-mono text-finance-muted uppercase">Onboarding & Documentation</p>
            </div>
          </div>
          <button (click)="closeGuide.emit()" class="w-10 h-10 rounded-full hover:bg-finance-border transition-colors flex items-center justify-center">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Content -->
        <div class="p-8 space-y-8">
          <!-- Section 1: What is it? -->
          <section>
            <h3 class="text-finance-accent font-mono text-xs uppercase tracking-widest mb-3">01. The Concept</h3>
            <p class="text-finance-text leading-relaxed">
              Alpha-Adapter is a professional-grade financial intelligence dashboard. It uses <span class="text-finance-accent">PEFT (Parameter-Efficient Fine-Tuning)</span> and <span class="text-finance-accent">LoRA adapters</span> to specialize a base AI model for specific market sectors. 
            </p>
          </section>

          <!-- Section 2: Who is it for? -->
          <section>
            <h3 class="text-finance-accent font-mono text-xs uppercase tracking-widest mb-3">02. Target Audience</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-finance-bg/50 border border-finance-border">
                <h4 class="text-sm font-bold mb-2 flex items-center gap-2">
                  <span class="material-icons text-xs">school</span> Beginners
                </h4>
                <p class="text-xs text-finance-muted leading-relaxed">Learn how AI interprets market volatility and sentiment without needing deep technical knowledge.</p>
              </div>
              <div class="p-4 rounded-xl bg-finance-bg/50 border border-finance-border">
                <h4 class="text-sm font-bold mb-2 flex items-center gap-2">
                  <span class="material-icons text-xs">trending_up</span> Analysts
                </h4>
                <p class="text-xs text-finance-muted leading-relaxed">Leverage sector-specific adapters to get nuanced insights that generic AI models might miss.</p>
              </div>
            </div>
          </section>

          <!-- Section 3: How to use? -->
          <section>
            <h3 class="text-finance-accent font-mono text-xs uppercase tracking-widest mb-3">03. Operational Flow</h3>
            <div class="space-y-4">
              <div class="flex gap-4">
                <div class="w-8 h-8 rounded-full bg-finance-border flex-shrink-0 flex items-center justify-center text-xs font-mono">1</div>
                <div>
                  <h4 class="text-sm font-bold">Select an Adapter</h4>
                  <p class="text-xs text-finance-muted">Use the left panel to switch between specialized LoRA weights (e.g., Tech, Healthcare). Each adapter has different accuracy and latency profiles.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-8 h-8 rounded-full bg-finance-border flex-shrink-0 flex items-center justify-center text-xs font-mono">2</div>
                <div>
                  <h4 class="text-sm font-bold">Monitor the Stream</h4>
                  <p class="text-xs text-finance-muted">The center chart shows real-time price and sentiment data. Watch how the "Sentiment Score" fluctuates as the market moves.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-8 h-8 rounded-full bg-finance-border flex-shrink-0 flex items-center justify-center text-xs font-mono">3</div>
                <div>
                  <h4 class="text-sm font-bold">Query the Agent</h4>
                  <p class="text-xs text-finance-muted">Ask the AI agent in the right panel for analysis. Try: "What is the current sentiment for tech?" or "Forecast the next 5 minutes."</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Section 4: Pro Tip -->
          <div class="p-4 rounded-xl bg-finance-accent/10 border border-finance-accent/20 flex gap-4 items-start">
            <span class="material-icons text-finance-accent">lightbulb</span>
            <div>
              <h4 class="text-sm font-bold text-finance-accent">Pro Tip: Stateful Context</h4>
              <p class="text-xs text-finance-accent/80 leading-relaxed">The agent uses Model Context Protocol (MCP) simulation. If you tell it about your portfolio, it will remember those assets throughout your session.</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-finance-border flex justify-end">
          <button (click)="closeGuide.emit()" class="px-6 py-2 bg-finance-accent text-finance-bg font-bold rounded-lg hover:opacity-90 transition-opacity">
            Got it, let's trade
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class GuideComponent {
  closeGuide = output<void>();
}
