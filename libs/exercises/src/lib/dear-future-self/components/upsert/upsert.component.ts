import { Component, HostListener } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'exercise-dear-future-self',
  templateUrl: 'upsert.component.html',
  styleUrls: ['./upsert.component.scss']
})

export class DearFutureSelfUpsertComponent {
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    // would be nice to prevent the navigation too
    this.modalCtrl.dismiss()
  }

  constructor(private modalCtrl: ModalController) { }

  dismiss() {
    this.modalCtrl.dismiss()
  }
}