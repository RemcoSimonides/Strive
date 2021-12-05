import { Component, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
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
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }

  public dailyGratefulness: DailyGratefulness

  constructor(
    private location: Location,
    private modalCtrl: ModalController,
    private service: DailyGratefulnessService,
    private user: UserService
  ) {
    window.history.pushState(null, null, window.location.href)
    modalCtrl.getTop().then(modal => {
      modal.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

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
    this.location.back()
  }
}
