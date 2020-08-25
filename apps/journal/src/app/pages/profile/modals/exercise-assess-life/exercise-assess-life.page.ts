import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-exercise-assess-life',
  templateUrl: './exercise-assess-life.page.html',
  styleUrls: ['./exercise-assess-life.page.scss'],
})
export class ExerciseAssessLifePage implements OnInit {

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
  }

  async dismiss() {
    await this.modalCtrl.dismiss()
  }
}
