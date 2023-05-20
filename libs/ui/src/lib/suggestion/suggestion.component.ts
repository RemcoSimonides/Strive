import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { orderBy, where } from 'firebase/firestore'

import { BehaviorSubject, Observable, Subscription, combineLatest, filter, map, tap, timer } from 'rxjs'

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

  suggestion$?: Observable<ChatGPTMessage | undefined>
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

  sub?: Subscription
  @Input() goalId = ''

  constructor(
    private cdr: ChangeDetectorRef,
    private chatGPTService: ChatGPTService,
    private milestoneService: MilestoneService
  ) {}

  ngOnInit() {
    this.suggestion$ = this.chatGPTService.valueChanges('RoadmapSuggestion', { goalId: this.goalId }).pipe(
      tap(_ => this.fetching$.next(false))
    )
    this.sub = this.chatGPTService.valueChanges('RoadmapMoreInfoQuestions', { goalId: this.goalId }).subscribe(message => {
      this.fetching$.next(false)
      if (!message) return
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

  submit() {
    console.log('submitted questions and answers: ', this.questions)
    this.fetching$.next(true)
    const prompt = this.questions.map(question => `question: ${question.question} answer: ${question.answer} `).join(',')
    const message = createChatGPTMessage({
      type: 'RoadmapMoreInfoAnswers',
      prompt
    })
    this.chatGPTService.add(message, { params: { goalId: this.goalId }})

    this.questions = []
    this.cdr.markForCheck()
  }
}