import { Component, HostListener } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'exercise-assess-life',
  templateUrl: './upsert.component.html',
  styleUrls: ['./upsert.component.scss']
})
export class AssessLifeUpsertComponent {
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
