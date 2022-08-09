import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
//ionic
import { LoadingController, ModalController, NavParams  } from '@ionic/angular'

//Services
import { GoalService } from '@strive/goal/goal/goal.service'

//Interfaces
import { createGoal, Goal, GoalStatus } from '@strive/model'
import { GoalForm } from '@strive/goal/goal/forms/goal.form';

// Directives
import { ModalDirective } from '@strive/utils/directives/modal.directive';

// Swiper
import { SwiperComponent } from 'swiper/angular';
import { UserService } from '@strive/user/user/user.service';

@Component({
  selector: 'goal-upsert',
  templateUrl: './upsert.component.html',
  styleUrls: ['./upsert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UpsertGoalModalComponent extends ModalDirective {

  goalId: string
  goalForm: GoalForm
  mode: 'update' | 'create'

  get goal(): Goal { return createGoal({ ...this.goalForm.getRawValue(), id: this.goalId }) }

  @ViewChild('swiper') swiper?: SwiperComponent;

  constructor(
    private goalService: GoalService,
    private loadingCtrl: LoadingController,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private navParams: NavParams,
    private user: UserService
  ) {
    super(location, modalCtrl)

    const goal = this.navParams.data['currentGoal'] as Goal
    const status: GoalStatus = this.user.user?.numberOfActiveGoals ?? 0 < 4 ? 'active' : 'bucketlist';
    if (goal) {
      this.mode = 'update'
      this.goalForm = new GoalForm({ ...goal })
      this.goalId = goal.id
    } else {
      this.mode = 'create'
      this.goalForm = new GoalForm({ status })
      this.goalId = this.goalService.createId()
    }

    this.loadingCtrl.getTop().then((v) => v ? this.loadingCtrl.dismiss() : undefined)
  }

  stepper(direction: 'next' | 'previous') {
    if (direction === 'next') {
      if (this.swiper?.swiperRef.isEnd) {
        this.dismiss()
      } else {
        this.swiper?.swiperRef.slideNext(100);
      }
    } else if (direction === 'previous') {
      this.swiper?.swiperRef.slidePrev(100);
    }
  }
}
