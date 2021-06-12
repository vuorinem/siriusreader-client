import { IReadingSummary } from './i-reading-summary';
import { InfographicService } from './infographic-service';
import { autoinject, ComponentAttached, computedFrom } from 'aurelia-framework';
import { IReaderMotivation } from './i-reader-motivation';
import { ITitle } from 'library/i-title';
import { BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, Tooltip } from 'chart.js';

Chart.register(
  LinearScale,
  BarController,
  CategoryScale,
  BarElement,
  Tooltip,
);

import 'styles/infographic.scss';
import { MinutesAndSecondsValueConverter } from './minutes-and-seconds-value-converter';

@autoinject
export class NrInfographic implements ComponentAttached {

  private title?: ITitle;
  private readerMotivation?: IReaderMotivation;
  private readingSummary?: IReadingSummary;

  private readerMotivationChart!: HTMLCanvasElement;
  private readingSessionChart!: HTMLCanvasElement;

  private engagementTypes = [
    {
      title: 'Slower than normal reading',
      colour: '#600',
    },
    {
      title: 'Deep reading',
      colour: '#b00',
    },
    {
      title: 'Scan reading',
      colour: '#740',
    },
    {
      title: 'Browsing',
      colour: '#470',
    },
    {
      title: 'Disengagement from book',
      colour: '#555',
    },
  ];

  @computedFrom('readingSummary')
  private get readingSpeedToBaselineComparison() {
    if (!this.readingSummary) {
      return '';
    }

    const readingSpeedDifferenceToBaseline =
      this.readingSummary.averageReadingSpeedWordsPerMinute
      - this.readingSummary.baselineReadingSpeedWordsPerMinute;

    if (readingSpeedDifferenceToBaseline < 0) {
      return 'slower than';
    } else if (readingSpeedDifferenceToBaseline > 0) {
      return 'faster than';
    } else {
      return 'similarly to';
    }
  }

  @computedFrom('readingSummary')
  private get readingSpeedToOverallAverageComparison() {
    if (!this.readingSummary) {
      return '';
    }

    const readingSpeedDifferenceToOverallAverage =
      this.readingSummary.averageReadingSpeedWordsPerMinute - 250;

    if (readingSpeedDifferenceToOverallAverage < 0) {
      return 'slower than';
    } else if (readingSpeedDifferenceToOverallAverage > 0) {
      return 'faster than';
    } else {
      return 'similarly to';
    }
  }

  constructor(private infographicService: InfographicService) {
  }

  public attached() {
    this.loadTitle();
    this.loadReaderMotivation();
    this.loadReadingSummary();
  }

  private async loadTitle() {
    this.title = await this.infographicService.getTitle();
  }

  private async loadReaderMotivation() {
    this.readerMotivation = await this.infographicService.getReaderMotivation();
    this.drawReaderMotivationChart();
  }

  private async loadReadingSummary() {
    this.readingSummary = await this.infographicService.getReadingSummary();
    this.drawReadingSessionChart();
  }

  private drawReaderMotivationChart() {
    if (!this.readerMotivation) {
      return;
    }

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
          y: {
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

  private drawReadingSessionChart() {
    if (!this.readingSummary) {
      return;
    }

    const canvasContext = this.readingSessionChart.getContext("2d");

    if (canvasContext === null) {
      throw new Error("Unable to access canvas");
    }

    var myChart = new Chart(canvasContext, {
      type: 'bar',
      data: {
        labels: [''],
        datasets: this.readingSummary.longestReadingSessionEngagements.map(item => {
          return {
            label: item.engagementType,
            data: [item.timeInMinutes],
            backgroundColor: this.engagementTypes.find(type => type.title === item.engagementType)?.colour,
          };
        }),
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Time (minutes)',
            },
          },
          y: {
            stacked: true,
            min: 0,
            max: this.readingSummary.longestReadingSessionInMinutes,
          },
        },
        interaction: {
          mode: 'nearest',
        },
        plugins: {
          tooltip: {
            xAlign: 'center',
            callbacks: {
              label: items => {
                const timeDisplay = MinutesAndSecondsValueConverter.print(items.raw as number);
                return ` ${items.dataset.label} for ${timeDisplay}`;
              },
            }
          }
        }
      }
    });
  }

}
