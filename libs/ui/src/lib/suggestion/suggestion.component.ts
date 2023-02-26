import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { BehaviorSubject, combineLatest, map, timer } from 'rxjs'

import { ToDatePipe } from '@strive/utils/pipes/date-fns.pipe'
import { HTMLPipeModule } from '@strive/utils/pipes/string-to-html.pipe'
import { MilestoneService } from '@strive/roadmap/milestone.service'
import { orderBy, where } from 'firebase/firestore'
import { createMilestone } from '@strive/model'


@Component({
  standalone: true,
  selector: '[goalId] strive-suggestion',
  templateUrl: './suggestion.component.html',
  styleUrls: ['./suggestion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ToDatePipe,
    HTMLPipeModule
  ]
})
export class SuggestionSComponent {

  _suggestion = ''
  _suggestions: Array<string> = []

  @Input() goalId = ''
  @Input() set suggestion(value: string) {
    const trimmed = value.trim().replace(/\r?\n|\r/g, '').trim() // regex removes new lines

    let parsed = parse(trimmed)
    if (!Array.isArray(parsed)) {
      // Replace single quotes with double quotes
      parsed = parse(trimmed.replace(new RegExp("'", 'g'), "\""))
    }

    if (Array.isArray(parsed)) {
      this._suggestions = parsed
      return
    }

    if (typeof parsed === 'string') {
      this._suggestion = value.trim()
      return
    }

    throw new Error(`Unrecognized type for suggestion`)
  }

  thinking$ = combineLatest([
    timer(0, 1000),
    new BehaviorSubject('.'),
  ]).pipe(
    map(([time]) => {
      if (time % 3 === 0) return '.'
      if (time % 3 === 1) return '..'
      return '...'
    })
  )

  added$ = new BehaviorSubject<boolean>(false)

  constructor(private milestoneService: MilestoneService) {}

  async apply() {
    if (!this.goalId) throw new Error('Goal Id is required in order to add milestones')

    this.added$.next(true)
    const current = await this.milestoneService.getValue([where('deletedAt', '==', null), orderBy('order', 'asc')], { goalId: this.goalId })
    const max = current.length ? Math.max(...current.map(milestone => milestone.order)) + 1 : 0

    const milestones = this._suggestions.map((content, index) => createMilestone({ order: max + index, content }))
    this.milestoneService.add(milestones, { params: { goalId: this.goalId }})
  }
}

function parse(value: string) {
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}