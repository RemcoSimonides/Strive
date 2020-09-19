import { Component, OnInit } from '@angular/core';
import { ICollectiveGoal } from '@strive/interfaces';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-collective-goal-share-popover',
  templateUrl: './collective-goal-share-popover.page.html',
  styleUrls: ['./collective-goal-share-popover.page.scss'],
})
export class CollectiveGoalSharePopoverPage implements OnInit {

  public _collectiveGoal: ICollectiveGoal
  public _isAdmin: boolean = false

  constructor(
    private _navParams: NavParams,
    private _popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    this._isAdmin = this._navParams.data.isAdmin
    this._collectiveGoal = this._navParams.data.collectiveGoal
  }

  public async close() {
    this._popoverCtrl.dismiss()
  }

}
