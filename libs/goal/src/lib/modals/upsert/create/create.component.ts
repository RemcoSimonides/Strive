import { CommonModule, Location } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core'
import { IonicModule, ModalController } from '@ionic/angular'
import { captureException } from '@sentry/angular'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { BehaviorSubject } from 'rxjs'
import { format, isFuture, isPast } from 'date-fns'

import { GoalForm } from '@strive/goal/forms/goal.form'
import { GoalService } from '@strive/goal/goal.service'
import { AuthService } from '@strive/auth/auth.service'
import { getCountry } from '@strive/utils/country'
import { createGoal } from '@strive/model'
import { ModalDirective } from '@strive/utils/directives/modal.directive'

import { GoalDetailsComponent } from '../components/details/details.component'
import { GoalImagesComponent } from '../components/images/images.component'
import { GoalRoadmapComponent } from '../components/roadmap/roadmap.component'
import { GoalShareComponent } from '../components/share/share.component'

type Steps = 'details' | 'images' | 'roadmap' | 'share'

@Component({
  standalone: true,
  selector: 'strive-goal-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    GoalDetailsComponent,
    GoalImagesComponent,
    GoalRoadmapComponent,
    GoalShareComponent
  ]
})
export class GoalCreateModalComponent extends ModalDirective implements OnDestroy {
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

  suggestion$ = new BehaviorSubject<string | undefined>(undefined)

  constructor(
    private auth: AuthService,
    private goalService: GoalService,
    protected override location: Location,
    protected override modalCtrl: ModalController
  ) {
    super(location, modalCtrl)
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

        this.goalService.upsert(this.goal, { params: { uid: this.auth.uid }})
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
      next = direction === 'next' ? 'share' : 'images'
    } else if (step === 'share') {
      direction === 'next' ? this.close() : next = 'roadmap'
    }
    this.stepper$.next(next)
  }

  close() {
    this.dismiss({ navToGoal: this.created ?  this.goal.id : false })
  }

  prepareSuggestion() {
    const { deadline, title  } = this.goal
    const end = format(deadline, 'dd MMMM yyyy')
    const today = format(new Date(), 'dd MMMM yyyy')
    const country = getCountry() ?? 'The Netherlands'
    if (title.length > 4 && isFuture(deadline)) {
      this.suggestion$.next('')
      const prompt = `I want to achieve "${title}" by ${end}. Today is ${today} and I live in ${country}. Could you break it down into milestones? Take the preparation, execution and celebration of the goal in account. Don't suggest a due date for the milestones. Return response ONLY in a JSON parsable array of strings.`
      const askOpenAI = httpsCallable<{ prompt: string }, { error: string, result: string }>(getFunctions(), 'askOpenAI')
      askOpenAI({ prompt }).then(res => {
        const { error, result } = res.data
        if (error) {
          captureException(result)
          this.suggestion$.next(`Sorry, couldn't create a suggestion`)
        } else {
          this.suggestion$.next(result)
        }
      })
    }
  }
}