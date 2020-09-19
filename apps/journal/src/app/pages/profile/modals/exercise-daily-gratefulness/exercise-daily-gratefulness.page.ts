import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
// Services
import { AuthService } from 'apps/journal/src/app/services/auth/auth.service';
import { ExercisesService } from 'apps/journal/src/app/services/exercises/exercises.service';
// Interfaces
import { IDailyGratefulness } from '@strive/interfaces';

@Component({
  selector: 'app-exercise-daily-gratefulness',
  templateUrl: './exercise-daily-gratefulness.page.html',
  styleUrls: ['./exercise-daily-gratefulness.page.scss'],
})
export class ExerciseDailyGratefulnessPage implements OnInit {

  public _dailyGratefulness: IDailyGratefulness

  constructor(
    private authService: AuthService,
    private exercisesService: ExercisesService,
    private modalCtrl: ModalController,
    ) { }

  async ngOnInit() {

    const { uid } = await this.authService.afAuth.currentUser;

    // load daily gratefulness settings
    this._dailyGratefulness = await this.exercisesService.getDailyGratefulnessSettings(uid)
    if (!this._dailyGratefulness || !this._dailyGratefulness.time) {
      this._dailyGratefulness = {
        on: false,
        time: '21:00'
      }
    }

  }

  async dismiss() {
    await this.modalCtrl.dismiss()
  }

  async switchOnOff() {
    if (!this._dailyGratefulness.on) {
      await this.saveDailyGratefulnessSettings(false)
    }
  }

  async saveDailyGratefulnessSettings(dismiss: boolean = true): Promise<void> {
    const { uid } = await this.authService.afAuth.currentUser;
    await this.exercisesService.saveDailyGratefulnessSettings(uid, this._dailyGratefulness)
    if (dismiss) this.dismiss()
  }

  async changedTime(event: CustomEvent) {
    const value = event.detail.value
    this._dailyGratefulness.time = value
  }

}
