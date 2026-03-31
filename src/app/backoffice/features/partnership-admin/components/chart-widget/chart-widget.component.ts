import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-widget',
  template: '<div class="chart-wrap"><canvas #cv></canvas></div>',
  styles: [
    `
      .chart-wrap {
        position: relative;
        height: 260px;
      }
    `,
  ],
})
export class ChartWidgetComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('cv') canvasRef?: ElementRef<HTMLCanvasElement>;

  @Input() config?: ChartConfiguration;

  private chart?: Chart;

  ngAfterViewInit(): void {
    this.tryRender();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    queueMicrotask(() => this.tryRender());
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private tryRender(): void {
    const el = this.canvasRef?.nativeElement;
    if (!el || !this.config) return;
    this.chart?.destroy();
    this.chart = new Chart(el, this.config);
  }
}
