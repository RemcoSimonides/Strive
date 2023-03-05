import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core'
import { Location } from '@angular/common'
import { IonContent, LoadingController, ModalController } from '@ionic/angular'
import { captureException } from '@sentry/angular'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { SwiperComponent } from 'swiper/angular'
import { format, isFuture, isPast } from 'date-fns'
import { BehaviorSubject } from 'rxjs'

import { GoalService } from '@strive/goal/goal.service'
import { AuthService } from '@strive/auth/auth.service'
import { createGoal } from '@strive/model'
import { GoalForm } from '@strive/goal/forms/goal.form'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { getCountry } from '@strive/utils/country'
import { Slide3Component } from './slides/slide-3/slide-3.component'

@Component({
  selector: 'strive-goal-upsert',
  templateUrl: './goal-upsert.component.html',
  styleUrls: ['./goal-upsert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UpsertGoalModalComponent extends ModalDirective implements OnInit {
  @ViewChild(Slide3Component) slide3?: Slide3Component
  @ViewChild('swiper') swiper?: SwiperComponent
  @ViewChild(IonContent) content?: IonContent

  form!: GoalForm
  mode?: 'update' | 'create'

  created = false // used for navigating to goal (only if goal is created)
  focus = false

  @Input() goal = createGoal()

  suggestion$ = new BehaviorSubject<string>('')

  constructor(
    private auth: AuthService,
    private goalService: GoalService,
    private loadingCtrl: LoadingController,
    protected override location: Location,
    protected override modalCtrl: ModalController
  ) {
    super(location, modalCtrl)

    this.loadingCtrl.getTop().then((v) => v ? this.loadingCtrl.dismiss() : undefined)
  }

  ngOnInit() {
    if (this.goal.id) {
      this.mode = 'update'
      this.form = new GoalForm(this.goal)
    } else {
      this.mode = 'create'
      this.goal.id = this.goalService.createId()
      this.form = new GoalForm()
    }
  }

  stepper(direction: 'next' | 'previous') {
    this.content?.scrollToTop()

    const activeIndex = this.swiper?.swiperRef.activeIndex
    if (activeIndex !== undefined) {
      if (activeIndex === 0) {
        if (this.form.dirty) {
          const goal = createGoal({ ...this.form.getGoalValue(), id: this.goal.id })
          if (isPast(goal.deadline)) goal.status = 'succeeded'

          if (!this.auth.uid) throw new Error('User needs to be logged in in order to create goal')
          this.goalService.upsert(goal, { params: { uid: this.auth.uid }})
          this.form.markAsPristine()
          this.created = true

          const title = this.form.title.value
          const deadline = format(this.form.deadline.value, 'dd MMMM yyyy')
          const now = format(new Date(), 'dd MMMM yyyy')
          const country = getCountry() ?? 'the Netherlands'
          if (title.length > 6 && isFuture(this.form.deadline.value)) {
            const prompt = `I want to achieve "${title}" by "${deadline}". Today is ${now} and I live in ${country}. Could you break it down into milestones? Take the preparation, execution and celebration of the goal in account. Don't suggest a due date for milestone. Return response ONLY in a JSON parsable array of strings.`
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

      if (activeIndex === 1) {
        if (this.slide3) {
          this.slide3.cropImage()
        }

        if (this.form.image.dirty) {
          this.goalService.upsert({ id: this.goal.id, image: this.form.image.value })
          this.form.image.markAsPristine()
        }
      }
    }

    if (direction === 'next') {
      if (this.swiper?.swiperRef.isEnd) {
        this.close()
      } else {
        this.swiper?.swiperRef.slideNext(100)
      }
    } else if (direction === 'previous') {
      this.swiper?.swiperRef.slidePrev(100)
    }
  }

  close() {
    this.dismiss({ navToGoal: this.created ? this.goal.id : false })
  }
}
