import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserService } from '@strive/user/user/+state/user.service';
import { DailyGratefulness } from '../../+state/daily-gratefulness.firestore';
import { DailyGratefulnessService } from '../../+state/daily-gratefulness.service';

@Component({
  selector: 'exercise-daily-gratefulness',
  templateUrl: 'upsert.component.html',
  styleUrls: ['./upsert.component.scss']
})
export class DailyGratefulnessUpsertComponent implements OnInit {

  public dailyGratefulness: DailyGratefulness

  constructor(
    private modalCtrl: ModalController,
    private service: DailyGratefulnessService,
    private user: UserService
  ) { }

  async ngOnInit() {
    this.dailyGratefulness = await this.service.getDailyGratefulnessSettings(this.user.uid);

    if (!this.dailyGratefulness || !this.dailyGratefulness.time) {
      this.dailyGratefulness = {
        on: false,
        time: '21:00'
      }
    }
  }

  toggle() {
    if (!this.dailyGratefulness.on) {
      this.service.save(this.user.uid, { on: true })
    }
  }

  save() {
    this.service.save(this.user.uid, this.dailyGratefulness)
    this.dismiss()
  }

  

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
