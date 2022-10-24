import { ChangeDetectionStrategy, Component, Input, OnDestroy, ViewChild } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'

import { BehaviorSubject, startWith, Subscription } from 'rxjs'
import { ChartConfiguration } from 'chart.js'
import { AES } from 'crypto-js'
import { formatISO } from 'date-fns'
import { BaseChartDirective } from 'ng2-charts'

import { aspectsConfig, WheelOfLifeEntry } from '@strive/model'

import { AuthService } from '@strive/user/auth/auth.service'
import { PersonalService } from '@strive/user/personal/personal.service'
import { WheelOfLifeEntryService } from '../../wheel-of-life.service'
import { delay } from '@strive/utils/helpers'

const primaryRGBA = 'rgba(249, 116, 29)'
const translucentPrimaryRGBA = 'rgba(249, 116, 29, 0.5)'

@Component({
  selector: 'exercise-wheel-of-life-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WheelOfLifeEntryComponent implements OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective
  @Input() set entry(entry: WheelOfLifeEntry<number> | undefined) {
    if (entry) this.form.patchValue(entry, { emitEvent: false})
    this.upsertChart()
  }

  aspectConfigs = aspectsConfig

  // order in formgroup should be same as aspectsConfig
  form = new FormGroup({
    health: new FormControl(50, { nonNullable: true }),
    family: new FormControl(50, { nonNullable: true }),
    friends: new FormControl(50, { nonNullable: true }),
    love: new FormControl(50, { nonNullable: true }),
    career: new FormControl(50, { nonNullable: true }),
    money: new FormControl(50, { nonNullable: true }),
    fun: new FormControl(50, { nonNullable: true }),
    development: new FormControl(50, { nonNullable: true }),
    environment: new FormControl(50, { nonNullable: true }),
    spirituality: new FormControl(50, { nonNullable: true })
  })

  radarChartOptions: ChartConfiguration<'radar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          maxTicksLimit: 15,
          showLabelBackdrop: false,
          callback: () => { return '' }
        },
        grid: {
          color: 'gray',
          circular: true,
        },
        pointLabels: {
          color: 'white',
          font: {
            weight: 'bold'
          }
        },
        angleLines: {
          color: 'gray',
        },
      },
    }
  }
  radarChartLabels = this.aspectConfigs.map(aspect => aspect.title)
  radarChartDatasets: ChartConfiguration<'radar'>['data']['datasets'] = []

  private today = formatISO(new Date(), { representation: 'date' })
  private sub: Subscription

  save$ = new BehaviorSubject<'save' | 'saving' | 'saved'>('save')

  constructor(
    private auth: AuthService,
    private personalService: PersonalService,
    private service: WheelOfLifeEntryService
  ) {
    this.sub = this.form.valueChanges.pipe(startWith()).subscribe(() => {
      this.upsertChart()
      if (this.save$.value === 'saved' && this.form.dirty) {
        this.save$.next('save')
      }
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  upsertChart() {
    if (!this.radarChartDatasets.length) {
      this.radarChartDatasets.push({
        data: Object.values(this.form.value),
        backgroundColor: translucentPrimaryRGBA,
        borderColor: primaryRGBA,
        pointBorderColor: 'white',
        pointBackgroundColor: 'white'
      })
    } else {
      this.radarChartDatasets[0].data = Object.values(this.form.value)
    }

    this.chart?.update()
  }

  async save() {
    if (!this.auth.uid) return
    this.save$.next('saving')
    const key = await this.personalService.getEncryptionKey()
    const values = this.form.value

    const entry: WheelOfLifeEntry<string> = {
      id: this.today,
      createdAt: new Date(),
      updatedAt: new Date(),
      career: AES.encrypt(`${values['career']}`, key).toString(),
      development: AES.encrypt(`${values['development']}`, key).toString(),
      environment: AES.encrypt(`${values['environment']}`, key).toString(),
      family: AES.encrypt(`${values['family']}`, key).toString(),
      friends: AES.encrypt(`${values['friends']}`, key).toString(),
      fun: AES.encrypt(`${values['fun']}`, key).toString(),
      health: AES.encrypt(`${values['health']}`, key).toString(),
      love: AES.encrypt(`${values['love']}`, key).toString(),
      money: AES.encrypt(`${values['money']}`, key).toString(),
      spirituality: AES.encrypt(`${values['spirituality']}`, key).toString(),
    }

    this.service.save(entry)

    delay(1500).then(() => { this.save$.next('saved') })
  }

}