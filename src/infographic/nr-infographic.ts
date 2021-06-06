import { InfographicService } from './infographic-service';
import { autoinject, ComponentAttached } from 'aurelia-framework';
import { IReaderMotivation } from './i-reader-motivation';
import { ITitle } from 'library/i-title';
import { BarController, BarElement, CategoryScale, Chart, LinearScale } from 'chart.js';

Chart.register(
  LinearScale,
  BarController,
  CategoryScale,
  BarElement,
);

import 'styles/infographic.scss';

@autoinject
export class NrInfographic implements ComponentAttached {

  private title?: ITitle;
  private readerMotivation?: IReaderMotivation;

  private readerMotivationChart!: HTMLCanvasElement;

  constructor(private infographicService: InfographicService) {
  }

  public attached() {
    this.loadTitle();
    this.loadReaderMotivation();
  }

  public async loadTitle() {
    this.title = await this.infographicService.getTitle();
  }

  public async loadReaderMotivation() {
    this.readerMotivation = await this.infographicService.getReaderMotivation();

    const canvasContext = this.readerMotivationChart.getContext("2d");

    if (canvasContext === null) {
      throw new Error("Unable to access canvas");
    }

    var myChart = new Chart(canvasContext, {
      type: 'bar',
      data: {
        datasets: [{
          data: this.readerMotivation.scores,
          backgroundColor: [
            '#ff6384',
            '#36a2eb',
            '#cc65fe',
            '#ffce56',
          ],
          parsing: {
            xAxisKey: 'name',
            yAxisKey: 'value',
          },
        }]
      },
      options: {
        scales: {
          yAxis: {
            min: 1,
            max: 7,
            ticks: {
              callback: (value) => {
                if (value === 1) {
                  return '1 - Strongly disagree';
                } else if (value === 4) {
                  return '4 - Neutral';
                } else if (value === 7) {
                  return '7 - Strongly agree';
                } else {
                  return '';
                }
              }
            }
          }
        }
      }
    });
  }

}
