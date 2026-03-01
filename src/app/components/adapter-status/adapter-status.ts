import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlphaAdapterService } from '../../services/alpha-adapter.service';

@Component({
  selector: 'app-adapter-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-finance-card border border-finance-border rounded-xl p-4 h-full">
      <h3 class="text-xs font-mono uppercase tracking-widest text-finance-muted mb-4">LoRA Adapter Registry</h3>
      <div class="space-y-3">
        @for (adapter of adapters(); track adapter.id) {
          <button 
            (click)="switchAdapter(adapter.id)"
            class="w-full text-left p-3 rounded-lg border transition-all group relative overflow-hidden"
            [ngClass]="adapter.active ? 'bg-finance-accent/5 border-finance-accent/30' : 'bg-finance-bg/50 border-finance-border hover:border-finance-muted'"
          >
            @if (adapter.active) {
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-finance-accent"></div>
            }
            <div class="flex justify-between items-start mb-1">
              <span class="text-sm font-bold" [class.text-finance-accent]="adapter.active">{{ adapter.name }}</span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-finance-border text-finance-muted uppercase">
                {{ adapter.sector }}
              </span>
            </div>
            <div class="flex gap-4 text-[10px] font-mono">
              <div class="flex items-center gap-1">
                <span class="text-finance-muted">ACC:</span>
                <span [class.text-finance-accent]="adapter.active">{{ adapter.accuracy * 100 }}%</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-finance-muted">LAT:</span>
                <span>{{ adapter.latency }}ms</span>
              </div>
            </div>
          </button>
        }
      </div>
      
      <div class="mt-6 p-4 rounded-lg bg-finance-bg/50 border border-dashed border-finance-border">
        <div class="flex items-center gap-2 mb-2">
          <span class="material-icons text-sm text-finance-accent">settings_input_component</span>
          <h4 class="text-[10px] font-mono uppercase text-finance-muted">Engine Configuration</h4>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-[10px] font-mono">
            <span class="text-finance-muted">Base Model</span>
            <span>Mistral-7B-v0.3</span>
          </div>
          <div class="flex justify-between text-[10px] font-mono">
            <span class="text-finance-muted">Quantization</span>
            <span>4-bit (NF4)</span>
          </div>
          <div class="flex justify-between text-[10px] font-mono">
            <span class="text-finance-muted">PEFT Method</span>
            <span>LoRA + QLoRA</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdapterStatusComponent {
  private service = inject(AlphaAdapterService);
  adapters = this.service.adapters;

  switchAdapter(id: string) {
    this.service.switchAdapter(id);
  }
}
