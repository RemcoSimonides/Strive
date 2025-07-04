import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild, inject } from '@angular/core'
import { addIcons } from 'ionicons'
import { close } from 'ionicons/icons'
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent, IonFooter } from '@ionic/angular/standalone'
import { BehaviorSubject } from 'rxjs'
import { format, isFuture, isPast } from 'date-fns'

import { GoalForm } from '@strive/goal/forms/goal.form'
import { GoalService } from '@strive/goal/goal.service'
import { AuthService } from '@strive/auth/auth.service'
import { ChatGPTService } from '@strive/chat/chatgpt.service'
import { getCountry } from '@strive/utils/country'
import { createChatGPTMessage, createGoal } from '@strive/model'
import { ModalDirective } from '@strive/utils/directives/modal.directive'

import { GoalDetailsComponent } from '../components/details/details.component'
import { GoalImagesComponent } from '../components/images/images.component'
import { GoalRoadmapComponent } from '../components/roadmap/roadmap.component'
import { GoalShareComponent } from '../components/share/share.component'
import { RemindersComponent } from '@strive/stakeholder/components/reminders/reminders.component'

type Steps = 'details' | 'images' | 'roadmap' | 'reminders' | 'share'

@Component({
    selector: 'strive-goal-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        GoalDetailsComponent,
        GoalImagesComponent,
        GoalRoadmapComponent,
        GoalShareComponent,
        RemindersComponent,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonButton,
        IonIcon,
        IonTitle,
        IonContent,
        IonFooter
    ]
})
export class GoalCreateModalComponent extends ModalDirective implements OnDestroy {
  private auth = inject(AuthService);
  private goalService = inject(GoalService);
  private chatGPTService = inject(ChatGPTService);

  @ViewChild(GoalImagesComponent) imagesComponent?: GoalImagesComponent

  form = new GoalForm()
  goal = createGoal({ id: this.goalService.createId() })
  stepper$ = new BehaviorSubject<Steps>('details')
  created = false
  sub = this.form.valueChanges.subscribe(() => {
    this.goal = createGoal({
      id: this.goal.id,
      ...this.form.getGoalValue()
    })
  })
  uid = this.auth.uid

  constructor() {
    super()

    addIcons({ close })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  stepper(direction: 'next' | 'previous') {
    if (!this.auth.uid) throw new Error('User needs to be logged in in order to create goal')

    const step = this.stepper$.value
    const { deadline } = this.goal
    let next: Steps = 'images'

    if (step === 'details') {
      if (this.form.dirty) {
        if (isPast(deadline)) this.goal.status = 'succeeded'

        this.goalService.upsert(this.goal, { params: { uid: this.auth.uid } })
        this.created = true
        this.form.markAsPristine()

        this.prepareSuggestion()
      }

      next = direction === 'next' ? 'images' : 'details'
    } else if (step === 'images') {
      if (this.form.image.dirty) {
        this.imagesComponent?.cropImage()
        this.goalService.upsert({ id: this.goal.id, image: this.goal.image })
        this.form.image.markAsPristine()
      }

      next = direction === 'next' ? 'roadmap' : 'details'
    } else if (step === 'roadmap') {
      next = direction === 'next' ? 'reminders' : 'images'
    } else if (step === 'reminders') {
      next = direction === 'next' ? 'share' : 'roadmap'
    } else if (step === 'share') {
      direction === 'next' ? this.close() : next = 'reminders'
    }
    this.stepper$.next(next)
  }

  close() {
    this.dismiss({ navToGoal: this.created ? this.goal.id : false })
  }

  prepareSuggestion() {
    const { deadline, title } = this.goal
    if (title.length > 4 && isFuture(deadline)) {
      const prompt = this.chatGPTService.getInitialPrompt(this.goal)

      const message = createChatGPTMessage({
        id: 'RoadmapSuggestion',
        prompt,
        type: 'RoadmapSuggestion'
      })
      this.chatGPTService.upsert(message, { params: { goalId: this.goal.id } })


      const end = format(deadline, 'dd MMMM yyyy')
      const today = format(new Date(), 'dd MMMM yyyy')
      const country = getCountry() ?? 'The Netherlands'
      const message2 = createChatGPTMessage({
        id: 'RoadmapMoreInfoQuestions',
        prompt: `Soon I am going to ask you to break down my goal into milestones. I want to achieve "${title}" by ${end}. Today is ${today} and I live in ${country}. What are 3 questions to ask the user to create a more specific roadmap?`,
        type: 'RoadmapMoreInfoQuestions'
      })
      this.chatGPTService.upsert(message2, { params: { goalId: this.goal.id } })
    }
  }
}
