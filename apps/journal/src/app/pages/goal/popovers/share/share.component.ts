import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';

@Component({
  selector: 'app-goal-share-popover',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class GoalSharePopoverPage implements OnInit {

  public _goal: Goal
  public _isAdmin: boolean = false
  public _isPublic: boolean = false

  constructor(
    private _navParams: NavParams,
    private _popoverCtrl: PopoverController
  ) { }

  async ngOnInit() {
    this._isAdmin = this._navParams.data.isAdmin
    this._goal = this._navParams.data.goal

    this._goal.publicity === 'public' ? this._isPublic = true : this._isPublic = false

  }

  public async close() {
    this._popoverCtrl.dismiss()
  }

}
