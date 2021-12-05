import { Component, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'exercise-dear-future-self',
  templateUrl: 'upsert.component.html',
  styleUrls: ['./upsert.component.scss']
})

export class DearFutureSelfUpsertComponent {
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }

  constructor(
    private location: Location,
    private modalCtrl: ModalController
  ) {
    window.history.pushState(null, null, window.location.href)
    modalCtrl.getTop().then(modal => {
      modal.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

  dismiss() {
    this.location.back()
  }
}