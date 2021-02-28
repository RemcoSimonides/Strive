import { Component, OnInit } from '@angular/core';
import { CollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-collective-goal-share-popover',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class CollectiveGoalSharePopoverPage implements OnInit {

  public collectiveGoal: CollectiveGoal
  public isAdmin = false

  constructor(
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    this.isAdmin = this.navParams.data.isAdmin
    this.collectiveGoal = this.navParams.data.collectiveGoal
  }

  public close() {
    this.popoverCtrl.dismiss()
  }
}
