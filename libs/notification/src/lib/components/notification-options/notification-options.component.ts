import { Component, OnInit } from '@angular/core';
import { Firestore, deleteDoc, doc } from '@angular/fire/firestore';
import { NavParams, PopoverController } from '@ionic/angular';


@Component({
  selector: 'notification-options',
  templateUrl: 'notification-options.component.html'
})
export class NotificationOptionsPopoverComponent implements OnInit {

  isAdmin = false
  reference: string

  constructor(
    private db: Firestore,
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
    await deleteDoc(doc(this.db, this.reference))
    this.dismiss(true)
  }

}