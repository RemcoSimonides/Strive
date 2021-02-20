import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'exercise-assess-life',
  templateUrl: './upsert.component.html',
  styleUrls: ['./upsert.component.scss']
})
export class AssessLifeUpsertComponent {
  constructor(private modalCtrl: ModalController) { }

  dismiss() {
    this.modalCtrl.dismiss()
  }
}
