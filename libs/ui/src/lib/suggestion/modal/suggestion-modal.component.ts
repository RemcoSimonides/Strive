import { CommonModule, Location } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { IonicModule, ModalController } from '@ionic/angular'
import { orderBy, where } from '@firebase/firestore'

import { isAfter, subMinutes } from 'date-fns'
import { BehaviorSubject, Observable, map, of, switchMap } from 'rxjs'

import { AuthService } from '@strive/auth/auth.service'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { ChatGPTService } from '@strive/chat/chatgpt.service'
import { MilestoneService } from '@strive/roadmap/milestone.service'

import { Goal, GoalStakeholder, Milestone, createChatGPTMessage, createGoalStakeholder } from '@strive/model'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { RoadmapModule } from '@strive/roadmap/components/roadmap/roadmap.module'
import { SuggestionSComponent } from '../suggestion.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@Component({
  standalone: true,
  selector: '[goalId] strive-suggestion-modal',
  templateUrl: './suggestion-modal.component.html',
  styleUrls: ['./suggestion-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    RoadmapModule,
    SuggestionSComponent,
    HeaderModalComponent
  ],
})
export class SuggestionModalComponent extends ModalDirective implements OnInit {

  milestones$?: Observable<Milestone[]>
  stakeholder$?: Observable<GoalStakeholder>
  fetching$ = new BehaviorSubject<boolean | undefined>(undefined)

  @Input() goal?: Goal

  constructor(
    private auth: AuthService,
    private chatGPTService: ChatGPTService,
    location: Location,
    modalCtrl: ModalController,
    private milestoneService: MilestoneService,
    private stakeholderService: GoalStakeholderService
  ) {
    super(location, modalCtrl)
  }

  async ngOnInit() {
    if (!this.goal) return
    const goalId = this.goal.id
    const query = [where('deletedAt', '==', null), orderBy('order', 'asc')]
    this.milestones$ = this.milestoneService.valueChanges(query, { goalId })
    this.stakeholder$ = this.auth.profile$.pipe(
      switchMap(user => user ? this.stakeholderService.valueChanges(user.uid, { goalId }) : of(undefined)),
      map(createGoalStakeholder)
    )

    const date = subMinutes(new Date(), 15)
    if (this.goal.createdAt && isAfter(this.goal.createdAt, date)) return
    const messages = await this.chatGPTService.getValue([where('type', '==', 'RoadmapUpdateSuggestion'), where('createdAt', '>', date)], { goalId })
    if (!messages.length) this.regenerateSuggestion()
  }

  regenerateSuggestion() {
    if (!this.goal) return
    this.fetching$.next(true)
    const prompt = this.chatGPTService.getInitialPrompt(this.goal) // Adding initial prompt in case it doesn't exist yet
    const message = createChatGPTMessage({ type: 'RoadmapUpdateSuggestion', prompt })
    this.chatGPTService.add(message, { params: { goalId: this.goal.id }})
  }
}