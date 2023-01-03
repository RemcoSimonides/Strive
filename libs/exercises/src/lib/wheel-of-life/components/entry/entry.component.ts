import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'

import { BehaviorSubject, combineLatest, map, Subscription } from 'rxjs'
import { ChartConfiguration } from 'chart.js'
import { AES } from 'crypto-js'
import { formatISO } from 'date-fns'
import { BaseChartDirective } from 'ng2-charts'

import { aspectsConfig, WheelOfLifeEntry } from '@strive/model'

import { AuthService } from '@strive/auth/auth.service'
import { PersonalService } from '@strive/user/personal/personal.service'
import { WheelOfLifeEntryService } from '../../wheel-of-life.service'
import { delay } from '@strive/utils/helpers'

const primaryRGBA = 'rgba(249, 116, 29)'
const translucentPrimaryRGBA = 'rgba(249, 116, 29, 0.5)'

const secondaryRGBA = 'rgba(0, 179, 163)'
const translucentSecondaryRGBA = 'rgba(0, 179, 163, 0.5)'

interface FormType {
  career: number
  development: number
  environment: number
  family: number
  friends: number
  fun: number
  health: number
  love: number
  money: number
  spirituality: number
}

interface DesiredFormType {
  desired_career: number
  desired_development: number
  desired_environment: number
  desired_family: number
  desired_friends: number
  desired_fun: number
  desired_health: number
  desired_love: number
  desired_money: number
  desired_spirituality: number
}

@Component({
  selector: 'exercise-wheel-of-life-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WheelOfLifeEntryComponent implements OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective
  @Input() set entry(entry: WheelOfLifeEntry<number> | undefined) {
    if (entry) {
      this.form.patchValue(entry)
      this.desiredForm.patchValue(entry)
    }
    this.upsertChart()
  }

  @Input() set previousEntry(entry: WheelOfLifeEntry<number> | undefined) {
    if (!entry) return
    this.desiredForm.patchValue(entry)
  }

  @Output() closeNavTo = new EventEmitter()

  aspectConfigs = aspectsConfig

  // order in formgroup should be same as aspectsConfig
  form = new FormGroup({
    health: new FormControl(5, { nonNullable: true }),
    family: new FormControl(5, { nonNullable: true }),
    friends: new FormControl(5, { nonNullable: true }),
    love: new FormControl(5, { nonNullable: true }),
    career: new FormControl(5, { nonNullable: true }),
    money: new FormControl(5, { nonNullable: true }),
    fun: new FormControl(5, { nonNullable: true }),
    development: new FormControl(5, { nonNullable: true }),
    environment: new FormControl(5, { nonNullable: true }),
    spirituality: new FormControl(5, { nonNullable: true })
  })

  // order in formgroup should be same as aspectsConfig
  desiredForm = new FormGroup({
    desired_health: new FormControl(5, { nonNullable: true }),
    desired_family: new FormControl(5, { nonNullable: true }),
    desired_friends: new FormControl(5, { nonNullable: true }),
    desired_love: new FormControl(5, { nonNullable: true }),
    desired_career: new FormControl(5, { nonNullable: true }),
    desired_money: new FormControl(5, { nonNullable: true }),
    desired_fun: new FormControl(5, { nonNullable: true }),
    desired_development: new FormControl(5, { nonNullable: true }),
    desired_environment: new FormControl(5, { nonNullable: true }),
    desired_spirituality: new FormControl(5, { nonNullable: true })
  })

  radarChartOptions: ChartConfiguration<'radar'>['options'] = {
    responsive: true,
    plugins: {
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
  private desiredSub: Subscription

  showForm = true
  save$ = new BehaviorSubject<'save' | 'saving' | 'saved'>('save')


  // This BehaviorSubject is here due to combineLatest (and async in html) not working with this.form.valueChanges for some reason
  _formValue = new BehaviorSubject<Partial<FormType>>(this.form.value)
  _desiredFormValue = new BehaviorSubject<Partial<DesiredFormType>>(this.desiredForm.value)
  top3 = combineLatest([
    this._formValue,
    this._desiredFormValue
  ]).pipe(
    map(([value, desiredValue]) => {
      const differences = this.aspectConfigs.map(config => {
        const current = value[config.id]
        const desired = desiredValue[`desired_${config.id}`]

        if (!current || !desired) return { ...config, difference: 0 }

        const difference = desired - current
        return { ...config, difference }
      })

      const filtered = differences.filter(diff => diff.difference > 5)
      const sorted = filtered.sort((a, b) => a.difference < b.difference ? 1 : -1)
      return sorted.slice(0, 3)
    })
  )

  constructor(
    private auth: AuthService,
    private personalService: PersonalService,
    private service: WheelOfLifeEntryService
  ) {

    this.sub = this.form.valueChanges.subscribe(value => {
      this._formValue.next(value)
      this.upsertChart()
      const dirty = this.form.dirty
      if (this.save$.value === 'saved' && dirty) {
        this.save$.next('save')
      }
    })

    this.desiredSub = this.desiredForm.valueChanges.subscribe(value => {
      this._desiredFormValue.next(value)
      this.upsertChart()
      const dirty = this.desiredForm.dirty
      if (this.save$.value === 'saved' && dirty) {
        this.save$.next('save')
      }
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
    this.desiredSub.unsubscribe()
  }

  upsertChart() {
    if (!this.radarChartDatasets.length) {
      this.radarChartDatasets.push(
        {
          data: Object.values(this.form.value),
          backgroundColor: translucentPrimaryRGBA,
          borderColor: primaryRGBA,
          pointBorderColor: 'white',
          pointBackgroundColor: 'white',
          label: 'How you feel'
        },
        {
          data: Object.values(this.desiredForm.value),
          backgroundColor: translucentSecondaryRGBA,
          borderColor: secondaryRGBA,
          pointBorderColor: 'gray',
          pointBackgroundColor: 'gray',
          label: 'How you want to feel'
        }
      )
    } else {
      this.radarChartDatasets[0].data = Object.values(this.form.value)
      this.radarChartDatasets[1].data = Object.values(this.desiredForm.value)
    }

    this.chart?.update()
  }

  async save() {
    if (!this.auth.uid) return
    this.save$.next('saving')
    const key = await this.personalService.getEncryptionKey()
    const values = this.form.value
    const desiredValues = this.desiredForm.value

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
      desired_career: AES.encrypt(`${desiredValues['desired_career']}`, key).toString(),
      desired_development: AES.encrypt(`${desiredValues['desired_development']}`, key).toString(),
      desired_environment: AES.encrypt(`${desiredValues['desired_environment']}`, key).toString(),
      desired_family: AES.encrypt(`${desiredValues['desired_family']}`, key).toString(),
      desired_friends: AES.encrypt(`${desiredValues['desired_friends']}`, key).toString(),
      desired_fun: AES.encrypt(`${desiredValues['desired_fun']}`, key).toString(),
      desired_health: AES.encrypt(`${desiredValues['desired_health']}`, key).toString(),
      desired_love: AES.encrypt(`${desiredValues['desired_love']}`, key).toString(),
      desired_money: AES.encrypt(`${desiredValues['desired_money']}`, key).toString(),
      desired_spirituality: AES.encrypt(`${desiredValues['desired_spirituality']}`, key).toString(),
    }

    this.service.save(entry)

    delay(1500).then(() => { 
      this.save$.next('saved')
      this.showForm = false
    })
  }

  createGoal() {
    this.closeNavTo.emit('')
  }
}