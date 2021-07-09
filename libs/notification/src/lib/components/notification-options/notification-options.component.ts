import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NavParams, PopoverController } from '@ionic/angular';


@Component({
  selector: 'notification-options',
  templateUrl: 'notification-options.component.html'
})
export class NotificationOptionsPopover implements OnInit {

  isAdmin = false
  reference: string

  constructor(
    private db: AngularFirestore,
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    this.isAdmin = this.navParams.get('isAdmin')
    this.reference = this.navParams.get('reference')
  }

  dismiss(remove: boolean = false) {
    this.popoverCtrl.dismiss({ remove })
  }

  async delete() {
    if (!this.isAdmin) return
    await this.db.doc(this.reference).delete()
    this.dismiss(true)
  }

}