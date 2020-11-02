import { Component, OnInit } from '@angular/core';
import { ICollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-collective-goal-share-popover',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class CollectiveGoalSharePopoverPage implements OnInit {

  public collectiveGoal: ICollectiveGoal
  public isAdmin: boolean = false

  constructor(
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    this.isAdmin = this.navParams.data.isAdmin
    this.collectiveGoal = this.navParams.data.collectiveGoal
  }

  public async close() {
    this.popoverCtrl.dismiss()
  }
}