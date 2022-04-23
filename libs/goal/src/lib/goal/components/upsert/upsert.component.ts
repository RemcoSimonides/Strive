import { ChangeDetectionStrategy, Component, HostBinding, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
//ionic
import { LoadingController, ModalController, NavParams  } from '@ionic/angular'

//Services
import { GoalService } from '@strive/goal/goal/+state/goal.service'

//Interfaces
import { createGoal, Goal, GoalStatus } from '@strive/goal/goal/+state/goal.firestore'
import { GoalForm } from '@strive/goal/goal/forms/goal.form';

// Swiper
import { SwiperComponent } from 'swiper/angular';
import { UserService } from '@strive/user/user/+state/user.service';

@Component({
  selector: 'goal-upsert',
  templateUrl: './upsert.component.html',
  styleUrls: ['./upsert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UpsertGoalModalComponent implements OnInit {

  goalId: string
  goalForm: GoalForm
  mode: 'update' | 'create'

  get goal(): Goal { return createGoal({ ...this.goalForm.value, id: this.goalId }) }

  @ViewChild('swiper') swiper: SwiperComponent;
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }
  @HostBinding() modal: HTMLIonModalElement

  constructor(
    private goalService: GoalService,
    private loadingCtrl: LoadingController,
    private location: Location,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private user: UserService
  ) {
    const goal = this.navParams.data.currentGoal as Goal
    const status: GoalStatus = this.user.user?.numberOfActiveGoals < 4 ? 'active' : 'bucketlist';
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

    window.history.pushState(null, null, window.location.href)
  }

  ngOnInit() {
    this.modal.onWillDismiss().then(res => {
      if (res.role === 'backdrop') this.location.back()
    })
  }

  dismiss(){
    this.location.back()

    // if (this.appName === 'journal') {
    //   await this.navCtrl.navigateForward(`/goal/${this.goalId}/edit`, { state: { mode: 'create' }});
    // } else if (this.appName === 'admin') {
    //   await this.navCtrl.navigateForward(`/a/goals/${this.goalId}`)
    // }
  }

  stepper(direction: 'next' | 'previous') {
    if (direction === 'next') {
      if (this.swiper.swiperRef.isEnd) {
        this.dismiss()
      } else {
        this.swiper.swiperRef.slideNext(100);
      }
    } else if (direction === 'previous') {
      this.swiper.swiperRef.slidePrev(100);
    }
  }
}
