import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent {
  @Input() chartTitle: string = 'Chart Title';
  @Input() chartType: string = 'Line';
  @Input() chartData: any;

  constructor() {}

  ngOnInit(): void {
    // Initialize ApexCharts here
    // const options = {
    //   chart: { type: this.chartType },
    //   series: [{ name: 'Series', data: this.chartData }]
    // };
    // ApexCharts.exec('chartId', 'updateOptions', options);
  }
}
