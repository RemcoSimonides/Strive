import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core'
import { Location } from '@angular/common'
import { LoadingController, ModalController } from '@ionic/angular'

//Services
import { GoalService } from '@strive/goal/goal.service'

//Interfaces
import { createGoal } from '@strive/model'
import { GoalForm } from '@strive/goal/forms/goal.form'

// Directives
import { ModalDirective } from '@strive/utils/directives/modal.directive'

// Swiper
import { SwiperComponent } from 'swiper/angular'

@Component({
  selector: 'strive-goal-upsert',
  templateUrl: './upsert.component.html',
  styleUrls: ['./upsert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UpsertGoalModalComponent extends ModalDirective implements OnInit {

  goalForm!: GoalForm
  mode?: 'update' | 'create'

  created = false // used for navigating to goal (only if goal is created)
  focus = false

  @Input() goal = createGoal()

  @ViewChild('swiper') swiper?: SwiperComponent

  constructor(
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
      this.goalForm = new GoalForm(this.goal)
    } else {
      this.mode = 'create'
      this.goal.id = this.goalService.createId()
      this.goalForm = new GoalForm()
    }
  }

  stepper(direction: 'next' | 'previous') {

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
