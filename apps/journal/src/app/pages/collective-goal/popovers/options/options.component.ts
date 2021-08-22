import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-collective-goal-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class CollectiveGoalOptionsPage implements OnInit {

  public enumCollectiveGoalOptions = enumCollectiveGoalOptions

  public isAdmin = false

  constructor(
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    this.isAdmin = this.navParams.data.isAdmin
  }

  close(goalOption: enumCollectiveGoalOptions){
    this.popoverCtrl.dismiss(goalOption)
  }

}

export enum enumCollectiveGoalOptions {
  ViewNotifications,
  EditNotificationSettings,
  editCollectiveGoal,
  deleteCollectiveGoal
}