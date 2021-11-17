import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { SwiperComponent } from "swiper/angular";

import { FcmService } from "@strive/utils/services/fcm.service";
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component';


@Component({
  selector: 'auth-welcome-modal',
  templateUrl: './welcome.modal.html',
  styleUrls: ['./welcome.modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom
})
export class WelcomeModal {
  @ViewChild('swiper') swiper: SwiperComponent;

  showStep2 = false;

  constructor(
    private fcm: FcmService,
    private modalCtrl: ModalController,
    private router: Router
  ) {
    const arr = ['/goal/', '/collective-goal/', 'profile'] // this includes template page
    this.showStep2 = !arr.some(value => this.router.url.includes(value))
  }

  dismiss(url?: string) {
    if (url) this.router.navigate([url])
    this.modalCtrl.dismiss()
  }

  next() {
    if (this.swiper.swiperRef.isEnd) {
      this.dismiss()
    } else {
      this.swiper.swiperRef.slideNext(100)
    }
  }

  pushNotifications() {
    this.fcm.registerFCM()
    this.next()
  }

  createGoal() {
    this.modalCtrl.dismiss()
    this.modalCtrl.create({
      component: UpsertGoalModalComponent
    }).then(modal => modal.present())
  }
}