import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core'
import { orderBy, where } from '@angular/fire/firestore'

import { BehaviorSubject, Subscription, combineLatest, map, timer } from 'rxjs'

import { MilestoneService } from '@strive/roadmap/milestone.service'
import { ChatGPTService } from '@strive/chat/chatgpt.service'
import { ChatGPTMessage, Milestone, createChatGPTMessage, createMilestone } from '@strive/model'
import { ScrollService } from '@strive/utils/services/scroll.service'
import { addIcons } from 'ionicons'
import { sparklesOutline, addOutline } from 'ionicons/icons'
import { IonIcon, IonList, IonItem, IonLabel, IonButton, IonInput } from '@ionic/angular/standalone'

@Component({
    selector: '[goalId] strive-suggestion',
    templateUrl: './suggestion.component.html',
    styleUrls: ['./suggestion.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormsModule,
        IonIcon,
        IonList,
        IonItem,
        IonLabel,
        IonButton,
        IonInput
    ]
})
export class SuggestionComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private chatGPTService = inject(ChatGPTService);
  private milestoneService = inject(MilestoneService);
  private scrolLService = inject(ScrollService);


  added$ = new BehaviorSubject<string[]>([])
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
  @Input() set fetch(value: boolean | undefined | null) {
    if (value === undefined || value === null) return
    this.fetching$.next(value)
  }

  private _milestones: Milestone[] = []
  get milestones() { return this._milestones }
  @Input() set milestones(milestones: Milestone[]) {
    if (!milestones) return
    this._milestones = milestones
    this.updateAdded()
  }

  constructor() {
    addIcons({ sparklesOutline, addOutline })
  }

  ngOnInit() {
    const sub = this.chatGPTService.docData('RoadmapSuggestion', { goalId: this.goalId }).subscribe(message => {
      if (!message) return
      this.suggestions.next(message)
      this.updateAdded()
      this.fetching$.next(false)
    })

    const sub2 = this.chatGPTService.docData('RoadmapMoreInfoQuestions', { goalId: this.goalId }).subscribe(message => {
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

  async addAllSuggestions(suggestions: string[]) {
    if (!this.goalId) throw new Error('Goal Id is required in order to add milestones')

    this.added$.next(suggestions)

    const current = await this.milestoneService.getDocs([where('deletedAt', '==', null), orderBy('order', 'asc')], { goalId: this.goalId })
    const max = current.length ? Math.max(...current.map(milestone => milestone.order)) + 1 : 0

    const milestones = suggestions.map((content, index) => createMilestone({ order: max + index, content }))
    this.milestoneService.add(milestones, { goalId: this.goalId })
  }

  async toggleSuggestion(content: string, index: number, element: any) {
    if (!this.goalId) throw new Error('Goal Id is required in order to add or remove milestone')

    const current = await this.milestoneService.getDocs([where('deletedAt', '==', null), orderBy('order', 'asc')], { goalId: this.goalId })

    if (this.added$.value.some(addedSuggestion => addedSuggestion === content)) {
        this.removeSuggestion(content, index, current)
    } else {
        this.addSuggestion(content, current)
    }

    // save element height because added element added to list above this is similar height
    this.scrolLService.scrollHeight = element.el.clientHeight
  }

  private async addSuggestion(content: string, milestones: Milestone[]) {
    if (!this.goalId) throw new Error('Goal Id is required in order to add milestones')

    const current = milestones.filter(milestone => !milestone.deletedAt)
    const max = current.length ? Math.max(...current.map(milestone => milestone.order)) + 1 : 0

    const milestone = createMilestone({ order: max, content })
    this.milestoneService.add(milestone, { goalId: this.goalId })
  }

  private async removeSuggestion(content: string, index: number, milestones: Milestone[]) {
    if (!this.goalId) throw new Error('Goal Id is required in order to add milestones')

    const milestone = milestones.find(milestone => milestone.content === content)
    if (!milestone) return

    this.milestoneService.remove(milestone.id, { goalId: this.goalId })
    this.added$.next(this.added$.value.filter(index => index !== index))
  }

  private updateAdded() {
    const suggestions = this.suggestions.value.answerParsed

    const added = this.milestones.filter(({ content }) => suggestions.includes(content))
    this.added$.next(added.map(({ content }) => content))
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
    this.chatGPTService.upsert(message, { goalId: this.goalId })

    this.questions = []
    this.cdr.markForCheck()
  }

  trackByFn(index: number) {
    return index
  }
}
