import { Component } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';

@Component({
  selector: 'goal-share-popover',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class GoalSharePopoverComponent {

  goal: Goal
  isAdmin = false
  isSecret = false

  constructor(
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) {
    this.isAdmin = this.navParams.data.isAdmin
    this.goal = this.navParams.data.goal

    this.isSecret = this.goal.publicity !== 'public'
  }

  close() {
    this.popoverCtrl.dismiss()
  }
}
