import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { NotificationService } from 'apps/journal/src/app/services/notification/notification.service';

@Component({
  selector: 'app-notification-options',
  templateUrl: './notification-options.page.html',
  styleUrls: ['./notification-options.page.scss'],
})
export class NotificationOptionsPage implements OnInit {

  _isAdmin: boolean
  _reference: string

  constructor(
    private navParams: NavParams,
    private _notificationService: NotificationService,
    private _popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    this._isAdmin = this.navParams.get('isAdmin')
    this._reference = this.navParams.get('reference')
  }

  dismiss(remove: boolean = false) {
    this._popoverCtrl.dismiss({
      remove: remove
    })
  }

  async delete() {
    if (!this._isAdmin) return
    
    await this._notificationService.delete(this._reference)
    this.dismiss(true)
  }

}
