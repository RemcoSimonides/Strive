import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { orderBy, where } from 'firebase/firestore'

import { BehaviorSubject, Subscription, combineLatest, filter, map, tap, timer } from 'rxjs'

import { ToDatePipe } from '@strive/utils/pipes/date-fns.pipe'
import { HTMLPipeModule } from '@strive/utils/pipes/string-to-html.pipe'
import { MilestoneService } from '@strive/roadmap/milestone.service'
import { ChatGPTService } from '@strive/chat/chatgpt.service'
import { createChatGPTMessage, createMilestone } from '@strive/model'


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
    HTMLPipeModule,
    FormsModule
  ]
})
export class SuggestionSComponent implements OnInit, OnDestroy {

  view$ = new BehaviorSubject<{ suggestion: string, suggestions: string[]}>({
    suggestion: '',
    suggestions: []
  })
  added$ = new BehaviorSubject<boolean>(false)

  questions: { question: string, answer: string }[] = []
  fetching$ = new BehaviorSubject<boolean>(false)

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

  subs: Subscription[] = []
  @Input() goalId = ''

  constructor(
    private cdr: ChangeDetectorRef,
    private chatGPTService: ChatGPTService,
    private milestoneService: MilestoneService
  ) {}

  ngOnInit() {
    const query = [where('type', '==', 'RoadmapSuggestion'), orderBy('createdAt', 'desc')]
    const sub = this.chatGPTService.valueChanges(query, { goalId: this.goalId }).pipe(
      map(messages => messages.map(message => message.answer)),
      map(answers => parseAnswer(answers[0])),
      tap(answer => {
        if (Array.isArray(answer)) {
          this.view$.next({
            suggestion: '',
            suggestions: answer
          })
        } else {
          this.view$.next({
            suggestion: answer,
            suggestions: []
          })
        }
      })
    ).subscribe()

    const query2 = [where('type', '==', 'RoadmapMoreInfoQuestions'), orderBy('createdAt', 'desc')]
    const sub2 = this.chatGPTService.valueChanges(query2, { goalId: this.goalId }).pipe(
      map(messages => messages.map(message => message.answer)),
      filter(answers => answers.length > 0),
      map(answers => parseAnswer(answers[0])),
      tap(answer => {
        if (Array.isArray(answer)) {
          this.questions = answer.map(question => ({ question, answer: '' }))
          this.fetching$.next(false)
          this.cdr.markForCheck()
        }
      })
    ).subscribe()

    this.subs.push(sub, sub2)
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

  async apply(roadmap: string[]) {
    if (!this.goalId) throw new Error('Goal Id is required in order to add milestones')

    this.added$.next(true)
    const current = await this.milestoneService.getValue([where('deletedAt', '==', null), orderBy('order', 'asc')], { goalId: this.goalId })
    const max = current.length ? Math.max(...current.map(milestone => milestone.order)) + 1 : 0

    const milestones = roadmap.map((content, index) => createMilestone({ order: max + index, content }))
    this.milestoneService.add(milestones, { params: { goalId: this.goalId }})
  }

  submit() {
    const prompt = this.questions.map(question => `question: ${question.question} answer: ${question.answer} `).join(',')
    const message = createChatGPTMessage({
      type: 'RoadmapMoreInfoAnswers',
      prompt
    })
    this.chatGPTService.add(message, { params: { goalId: this.goalId }})

    this.view$.next({
      suggestion: 'asking',
      suggestions: []
    })
    this.questions = []
    this.cdr.markForCheck()
  }
}

function parseAnswer(answer: string): string | string[] {
  if (answer === 'asking' || answer === 'error') return answer

  const trimmed = answer.trim().replace(/\r?\n|\r/g, '').trim()  // regex removes new lines
  const split = trimmed.split('```')
  const parsable = split.filter(canParse)

  // return raw answer if no parsable json
  if (!parsable.length) return answer.trim()

  let parsed = parse(parsable[0])
  if (!Array.isArray(parsed)) {
    // Replace single quotes with double quotes
    parsed = parse(trimmed.replace(new RegExp("'", 'g'), "\""))
  }

  if (Array.isArray(parsed)) {
    return parsed as string[]
  }

  if (typeof parsed === 'string') {
    return answer.trim() // show raw answer as last result
  }

  throw new Error(`Unrecognized type for suggestion`)
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