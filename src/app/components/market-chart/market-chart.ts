import { Component, ElementRef, ViewChild, AfterViewInit, inject, effect } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import * as d3 from 'd3';
import { AlphaAdapterService, MarketData } from '../../services/alpha-adapter.service';

@Component({
  selector: 'app-market-chart',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="w-full h-full flex flex-col p-4 bg-finance-card border border-finance-border rounded-xl">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="text-xs font-mono uppercase tracking-widest text-finance-muted">Real-time Stream</h3>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold font-mono">{{ currentPrice() | number:'1.2-2' }}</span>
            <span class="text-xs font-mono" [class.text-finance-accent]="isUp()" [class.text-red-500]="!isUp()">
              {{ isUp() ? '▲' : '▼' }} {{ priceChange() | number:'1.2-2' }}%
            </span>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="text-right">
            <p class="text-[10px] font-mono text-finance-muted uppercase">Latency</p>
            <p class="text-xs font-mono text-finance-accent">{{ activeAdapter()?.latency }}ms</p>
          </div>
          <div class="text-right">
            <p class="text-[10px] font-mono text-finance-muted uppercase">Adapter</p>
            <p class="text-xs font-mono">{{ activeAdapter()?.name }}</p>
          </div>
        </div>
      </div>
      <div #chartContainer class="flex-1 w-full min-h-[200px] relative">
        <svg #svg class="w-full h-full overflow-visible"></svg>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
  `]
})
export class MarketChartComponent implements AfterViewInit {
  @ViewChild('chartContainer') container!: ElementRef;
  @ViewChild('svg') svgRef!: ElementRef;

  private service = inject(AlphaAdapterService);
  activeAdapter = this.service.activeAdapter;
  
  currentPrice = () => this.service.marketData().slice(-1)[0]?.price || 0;
  priceChange = () => {
    const data = this.service.marketData();
    if (data.length < 2) return 0;
    const prev = data[data.length - 2].price;
    const curr = data[data.length - 1].price;
    return ((curr - prev) / prev) * 100;
  };
  isUp = () => this.priceChange() >= 0;

  constructor() {
    effect(() => {
      const data = this.service.marketData();
      if (data.length > 0) {
        this.updateChart(data);
      }
    });
  }

  ngAfterViewInit() {
    this.initChart();
  }

  private initChart() {
    // Initial setup if needed
  }

  private updateChart(data: MarketData[]) {
    if (!this.svgRef) return;

    const element = this.container.nativeElement;
    const width = element.clientWidth;
    const height = element.clientHeight;
    const margin = { top: 10, right: 30, bottom: 20, left: 40 };

    const svg = d3.select(this.svgRef.nativeElement);
    svg.selectAll("*").remove();

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.timestamp) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.price)! * 0.999,
        d3.max(data, d => d.price)! * 1.001
      ])
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    svg.append("g")
      .attr("class", "grid-line")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(-height + margin.top + margin.bottom).tickFormat(() => ""));

    svg.append("g")
      .attr("class", "grid-line")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(-width + margin.left + margin.right).tickFormat(() => ""));

    // Line
    const line = d3.line<MarketData>()
      .x(d => x(d.timestamp))
      .y(d => y(d.price))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("class", "chart-line")
      .attr("stroke", "var(--color-finance-accent)")
      .attr("d", line);

    // Area
    const area = d3.area<MarketData>()
      .x(d => x(d.timestamp))
      .y0(height - margin.bottom)
      .y1(d => y(d.price))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("class", "chart-area")
      .attr("fill", "var(--color-finance-accent)")
      .attr("d", area);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(0).tickPadding(8))
      .attr("class", "axis-text")
      .select(".domain").remove();

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(8))
      .attr("class", "axis-text")
      .select(".domain").remove();
  }
}
