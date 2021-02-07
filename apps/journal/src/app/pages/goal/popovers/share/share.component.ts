import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';

@Component({
  selector: 'app-goal-share-popover',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class GoalSharePopoverPage implements OnInit {

  public goal: Goal
  public isAdmin = false
  public isPublic = false

  constructor(
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    this.isAdmin = this.navParams.data.isAdmin
    this.goal = this.navParams.data.goal

    this.isPublic = this.goal.publicity === 'public'
  }

  public close() {
    this.popoverCtrl.dismiss()
  }

}
