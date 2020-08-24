import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-collective-goal-options',
  templateUrl: './collective-goal-options.page.html',
  styleUrls: ['./collective-goal-options.page.scss'],
})
export class CollectiveGoalOptionsPage implements OnInit {

  public enumCollectiveGoalOptions = enumCollectiveGoalOptions

  public _isAdmin: boolean = false
  public _isPublic: boolean = false

  constructor(
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    this._isAdmin = this.navParams.data.isAdmin
    this._isPublic = this.navParams.data.isPublic
  }

  async close(goalOption: enumCollectiveGoalOptions){
    this.popoverCtrl.dismiss(goalOption)
  }

}

export enum enumCollectiveGoalOptions {
  ViewNotifications,
  EditNotificationSettings,
  editCollectiveGoal,
  deleteCollectiveGoal
}