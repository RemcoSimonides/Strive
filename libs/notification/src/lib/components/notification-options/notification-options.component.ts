import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';

// Strive
import { NotificationService } from '@strive/notification/+state/notification.service';


@Component({
  selector: 'notification-options',
  templateUrl: 'notification-options.component.html'
})

export class NotificationOptionsPopover implements OnInit {

  isAdmin = false
  reference: string

  constructor(
    private navParams: NavParams,
    private notificationService: NotificationService,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    this.isAdmin = this.navParams.get('isAdmin')
    this.reference = this.navParams.get('reference')
  }

  dismiss(remove: boolean = false) {
    this.popoverCtrl.dismiss({
      remove: remove
    })
  }

  async delete() {
    if (!this.isAdmin) return
    
    await this.notificationService.delete(this.reference)
    this.dismiss(true)
  }

}