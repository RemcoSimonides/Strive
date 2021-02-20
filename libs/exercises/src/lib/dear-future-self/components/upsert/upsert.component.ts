import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'exercise-dear-future-self',
  templateUrl: 'upsert.component.html',
  styleUrls: ['./upsert.component.scss']
})

export class DearFutureSelfUpsertComponent {
  constructor(private modalCtrl: ModalController) { }

  dismiss() {
    this.modalCtrl.dismiss()
  }
}