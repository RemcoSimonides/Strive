import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { orderBy, where } from 'firebase/firestore'

import { BehaviorSubject, Subscription, combineLatest, map, timer } from 'rxjs'

import { ToDatePipe } from '@strive/utils/pipes/date-fns.pipe'
import { HTMLPipeModule } from '@strive/utils/pipes/string-to-html.pipe'
import { MilestoneService } from '@strive/roadmap/milestone.service'
import { ChatGPTService } from '@strive/chat/chatgpt.service'
import { ChatGPTMessage, createChatGPTMessage, createMilestone } from '@strive/model'


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

  added$ = new BehaviorSubject<number[]>([])
  suggestions = new BehaviorSubject<ChatGPTMessage>(createChatGPTMessage())

  questions: { question: string, answer: string }[] = []
  fetching$ = new BehaviorSubject<boolean>(false)

  view$ = combineLatest([
    this.suggestions.asObservable(),
    this.fetching$.asObservable(),
    this.added$.asObservable()
  ]).pipe(map(([suggestion, fetching, added]) => ({ suggestion, fetching, added })))

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
  @Input() set fetch(value: boolean | undefined) {
    if (value === undefined) return
    this.fetching$.next(value)
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private chatGPTService: ChatGPTService,
    private milestoneService: MilestoneService
  ) {}

  ngOnInit() {
    const sub = this.chatGPTService.valueChanges('RoadmapSuggestion', { goalId: this.goalId }).subscribe(message => {
      if (!message) return
      this.suggestions.next(message)
      this.fetching$.next(false)
    })

    const sub2 = this.chatGPTService.valueChanges('RoadmapMoreInfoQuestions', { goalId: this.goalId }).subscribe(message => {
      if (!message) return
      this.fetching$.next(false)
      message.answerParsed.forEach((question, index) => {
        const item = this.questions[index]
        if (item) {
          this.questions[index].question = question
        } else {
          this.questions[index] = { question, answer: '' }
        }
        this.cdr.markForCheck()
      })
    })

    this.subs.push(sub, sub2)
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

  async addAllSuggestions(roadmap: string[]) {
    if (!this.goalId) throw new Error('Goal Id is required in order to add milestones')

    this.added$.next(roadmap.map((_, index) => index))

    const current = await this.milestoneService.getValue([where('deletedAt', '==', null), orderBy('order', 'asc')], { goalId: this.goalId })
    const max = current.length ? Math.max(...current.map(milestone => milestone.order)) + 1 : 0

    const milestones = roadmap.map((content, index) => createMilestone({ order: max + index, content }))
    this.milestoneService.add(milestones, { params: { goalId: this.goalId }})
  }

  async addSuggestion(content: string, index: number) {
    if (!this.goalId) throw new Error('Goal Id is required in order to add milestones')

    const current = await this.milestoneService.getValue([where('deletedAt', '==', null), orderBy('order', 'asc')], { goalId: this.goalId })
    const max = current.length ? Math.max(...current.map(milestone => milestone.order)) + 1 : 0

    const milestone = createMilestone({ order: max, content })
    this.milestoneService.add(milestone, { params: { goalId: this.goalId }})

    this.added$.next([...this.added$.value, index])
  }

  submit() {
    const prompt = this.questions
      .filter(question => question.answer)
      .map(question => `question: ${question.question} answer: ${question.answer} `).join(',')
    if (!prompt) return
    this.fetching$.next(true)
    const message = createChatGPTMessage({
      type: 'RoadmapMoreInfoAnswers',
      prompt
    })
    this.chatGPTService.add(message, { params: { goalId: this.goalId }})

    this.questions = []
    this.cdr.markForCheck()
  }
}