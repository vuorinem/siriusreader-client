import { IReadingSummary } from './i-reading-summary';
import { InfographicService } from './infographic-service';
import { autoinject, ComponentAttached, computedFrom } from 'aurelia-framework';
import { IReaderMotivation } from './i-reader-motivation';
import { ITitle } from 'library/i-title';
import { MinutesAndSecondsValueConverter } from './minutes-and-seconds-value-converter';
import { IChronologySummary } from './i-chronology-summary';
import { ILocationSummary } from './i-location-summary';
import { BarController, BarElement, CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement, Tooltip, Legend } from 'chart.js';

Chart.register(
  LinearScale,
  BarController,
  CategoryScale,
  BarElement,
  Tooltip,
  LineElement,
  LineController,
  PointElement,
);

import 'styles/infographic.scss';

@autoinject
export class NrInfographic implements ComponentAttached {

  private title?: ITitle;
  private readerMotivation?: IReaderMotivation;
  private readingSummary?: IReadingSummary;
  private chronologySummary?: IChronologySummary;
  private locationSummary?: ILocationSummary;

  private readerMotivationChart!: HTMLCanvasElement;
  private readingSessionChart!: HTMLCanvasElement;
  private chronologyChart!: HTMLCanvasElement;
  private locationSummaryChart!: HTMLCanvasElement;

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
    if (!this.readingSummary || !this.readingSummary.averageReadingSpeedWordsPerMinute) {
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
    if (!this.readingSummary || !this.readingSummary.averageReadingSpeedWordsPerMinute) {
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

  @computedFrom('locationSummary')
  private get mostPopularReadingLocation() {
    if (!this.locationSummary || this.locationSummary.locationCounts.length === 0) {
      return '';
    }

    return this.locationSummary.locationCounts[0].location;
  }

  constructor(private infographicService: InfographicService) {
  }

  public attached() {
    this.loadTitle();
    this.loadReaderMotivation();
    this.loadReadingSummary();
    this.loadChronologySummary();
    this.loadLocationSummary();
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

  private async loadChronologySummary() {
    this.chronologySummary = await this.infographicService.getChronologySummary();
    this.drawChronologyChart();
  }

  private async loadLocationSummary() {
    this.locationSummary = await this.infographicService.getLocationSummary();
    this.drawLocationChart();
  }

  private drawReaderMotivationChart() {
    if (!this.readerMotivation) {
      return;
    }

    const canvasContext = this.readerMotivationChart.getContext("2d");

    if (canvasContext === null) {
      throw new Error("Unable to access canvas");
    }

    new Chart(canvasContext, {
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

    new Chart(canvasContext, {
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

  private drawChronologyChart() {
    if (!this.chronologySummary) {
      return;
    }

    const canvasContext = this.chronologyChart.getContext("2d");

    if (canvasContext === null) {
      throw new Error("Unable to access canvas");
    }

    const locations: { x: number, y: number }[] = [{ x: 0, y: 0 }];
    for (const position of this.chronologySummary.readingPositions) {
      locations.push({
        x: 100 * position.location / this.chronologySummary.charactersInBook,
        y: position.timeInMinutes,
      });
    }

    const lastTime = locations[locations.length - 1].y;

    const trendline = [
      { x: 0, y: 0 },
      {
        x: 100 * lastTime * this.chronologySummary.baselineLocationsPerMinute / this.chronologySummary.charactersInBook,
        y: lastTime,
      },
    ];

    new Chart(canvasContext, {
      type: 'line',
      data: {
        datasets: [
          {
            data: locations,
            pointRadius: 0,
            borderColor: '#ff0000',
            borderWidth: 1,
          },
          {
            data: trendline,
            pointRadius: 0,
            borderColor: '#777777',
            borderWidth: 2,
            borderDash: [3, 3],
          }
        ]
      },
      options: {
        scales: {
          x: {
            type: 'linear',
            min: 0,
            max: 100,
            ticks: {
              callback: value => `${value} %`
            },
            title: {
              display: true,
              text: 'Location in book'
            }
          },
          y: {
            type: 'linear',
            min: 0,
            max: lastTime,
            ticks: {
              callback: value => Math.round(value as number),
            },
            title: {
              display: true,
              text: 'Time spent reading (minutes)'
            }
          }
        },
        plugins: {
          tooltip: {
            enabled: false,
          }
        }
      }
    });
  }

  private drawLocationChart() {
    if (!this.locationSummary) {
      return;
    }

    const canvasContext = this.locationSummaryChart.getContext("2d");

    if (canvasContext === null) {
      throw new Error("Unable to access canvas");
    }

    new Chart(canvasContext, {
      type: 'bar',
      data: {
        datasets: [{
          data: this.locationSummary.locationCounts,
          backgroundColor: [
            '#ff6384',
            '#36a2eb',
            '#cc65fe',
            '#ffce56',
          ],
          parsing: {
            xAxisKey: 'count',
            yAxisKey: 'location',
          },
        }]
      },
      options: {
        indexAxis: 'y',
      }
    });
  }

}
