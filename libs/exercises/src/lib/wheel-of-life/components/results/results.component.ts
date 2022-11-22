import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core'
import { aspectsConfig, WheelOfLifeEntry } from '@strive/model'
import { ChartConfiguration } from 'chart.js'
import { BaseChartDirective } from 'ng2-charts'

const primaryRGBA = 'rgba(249, 116, 29)'
const secondaryRGBA = 'rgba(0,179,163)'

@Component({
  selector: 'exercise-wheel-of-life-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WheelOfLifeResultsComponent {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective

  aspectsConfig = aspectsConfig
  private _aspectConfig = aspectsConfig[0]
  private _entries: WheelOfLifeEntry<number>[] = []

  @Input() set entries(entries: WheelOfLifeEntry<number>[]) {
    this._entries = entries.filter(entry => !!entry.createdAt)
    this.upsertChart()
  }

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: { enabled: false }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'gray'
        },
        ticks: {
          maxTicksLimit: 6,
          callback: (context) => {
            if (context === 100) return '😁'
            if (context === 0) return '😭'
            return ''
          },
          font: {
            size: 16
          }
        }
      }
    }
  }

  chartDatasets: ChartConfiguration<'line'>['data']['datasets'] = []

  segmentChanged(ev: any) {
    const config = aspectsConfig.find(c => c.id === ev.detail.value)
    if (config) this._aspectConfig = config
    this.upsertChart()
  }

  upsertChart() {
    this.chartDatasets = []
    const data = this._entries.map(entry => {
      return { x: entry.createdAt.getTime(), y: entry[this._aspectConfig.id] }
    })
    const wishData = this._entries.map(entry => {
      return { x: entry.createdAt.getTime(), y: entry[`desired_${this._aspectConfig.id}`]}
    })

    this.chartDatasets.push(
      {
        data,
        label: 'How you felt',
        backgroundColor: primaryRGBA,
        borderColor: primaryRGBA,
        pointBorderColor: 'white',
        pointBackgroundColor: 'white'
      },
      {
        data: wishData,
        label: `How you wanted to feel`,
        backgroundColor: secondaryRGBA,
        borderColor: secondaryRGBA,
        pointBorderColor: 'gray',
        pointBackgroundColor: 'gray'
      }
    )
    this.chart?.update()
  }
}