import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { IGoal, enumGoalPublicity } from 'apps/journal/src/app/interfaces/goal.interface';

@Component({
  selector: 'app-goal-share-popover',
  templateUrl: './goal-share-popover.page.html',
  styleUrls: ['./goal-share-popover.page.scss'],
})
export class GoalSharePopoverPage implements OnInit {

  public _goal: IGoal
  public _isAdmin: boolean = false
  public _isPublic: boolean = false

  constructor(
    private _navParams: NavParams,
    private _popoverCtrl: PopoverController
  ) { }

  async ngOnInit() {
    this._isAdmin = this._navParams.data.isAdmin
    this._goal = this._navParams.data.goal

    this._goal.publicity === enumGoalPublicity.public ? this._isPublic = true : this._isPublic = false

  }

  public async close() {
    this._popoverCtrl.dismiss()
  }

}
