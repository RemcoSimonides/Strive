import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { orderBy, where } from 'firebase/firestore'

import { BehaviorSubject, Subscription, combineLatest, map, tap, timer } from 'rxjs'

import { ToDatePipe } from '@strive/utils/pipes/date-fns.pipe'
import { HTMLPipeModule } from '@strive/utils/pipes/string-to-html.pipe'
import { MilestoneService } from '@strive/roadmap/milestone.service'
import { ChatGPTService } from '@strive/chat/chatgpt.service'
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
export class SuggestionSComponent implements OnInit, OnDestroy {

  view$ = new BehaviorSubject<{ suggestion: string, suggestions: string[]}>({
    suggestion: '',
    suggestions: []
  })

  @Input() goalId = ''

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

  sub?: Subscription

  constructor(
    private chatGPTService: ChatGPTService,
    private milestoneService: MilestoneService
  ) {}

  ngOnInit() {
    const query = [where('type', '==', 'RoadmapSuggestion'), orderBy('createdAt', 'desc')]
    this.sub = this.chatGPTService.valueChanges(query, { goalId: this.goalId }).pipe(
      map(messages => messages.map(message => message.answer)),
      map(answers => answers[0]),
      tap(answer => {
        if (answer === 'asking' || answer === 'error') {
          this.view$.next({
            suggestion: answer,
            suggestions: []
          })
          return
        }

        const trimmed = answer.trim().replace(/\r?\n|\r/g, '').trim()  // regex removes new lines
        const noJSON = trimmed.replace("json", "") // remove json from string
        const split = noJSON.split('```')
        const parsable = split.filter(canParse)

        if (!parsable.length) {
          this.view$.next({
            suggestion: 'error',
            suggestions: []
          })
          return
        }

        let parsed = parse(parsable[0])
        if (!Array.isArray(parsed)) {
          // Replace single quotes with double quotes
          parsed = parse(trimmed.replace(new RegExp("'", 'g'), "\""))
        }

        if (Array.isArray(parsed)) {
          this.view$.next({
            suggestion: '',
            suggestions: parsed
          })
          return
        }

        if (typeof parsed === 'string') {
          this.view$.next({
            suggestion: answer.trim(), // show raw answer as last result
            suggestions: []
          })
          return
        }

        throw new Error(`Unrecognized type for suggestion`)
      })
    ).subscribe()
  }

  ngOnDestroy() {
    this.sub?.unsubscribe()
  }

  async apply(roadmap: string[]) {
    if (!this.goalId) throw new Error('Goal Id is required in order to add milestones')

    this.added$.next(true)
    const current = await this.milestoneService.getValue([where('deletedAt', '==', null), orderBy('order', 'asc')], { goalId: this.goalId })
    const max = current.length ? Math.max(...current.map(milestone => milestone.order)) + 1 : 0

    const milestones = roadmap.map((content, index) => createMilestone({ order: max + index, content }))
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

function canParse(value: string) {
  try {
    JSON.parse(value)
    return true
  } catch (e) {
    return false
  }
}