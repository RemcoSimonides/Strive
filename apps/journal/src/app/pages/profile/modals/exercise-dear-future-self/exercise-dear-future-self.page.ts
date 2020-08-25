import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-exercise-dear-future-self',
  templateUrl: './exercise-dear-future-self.page.html',
  styleUrls: ['./exercise-dear-future-self.page.scss'],
})
export class ExerciseDearFutureSelfPage implements OnInit {

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
  }

  async dismiss() {
    await this.modalCtrl.dismiss()
  }

}
