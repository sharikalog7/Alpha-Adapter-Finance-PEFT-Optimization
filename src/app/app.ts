import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {MarketChartComponent} from './components/market-chart/market-chart';
import {ChatPanelComponent} from './components/chat-panel/chat-panel';
import {AdapterStatusComponent} from './components/adapter-status/adapter-status';
import {GuideComponent} from './components/guide/guide';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [MarketChartComponent, ChatPanelComponent, AdapterStatusComponent, GuideComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  showGuide = signal(true);

  toggleGuide() {
    this.showGuide.update(v => !v);
  }
}
