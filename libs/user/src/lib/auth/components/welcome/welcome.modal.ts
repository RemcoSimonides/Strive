import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { FcmService } from "@strive/utils/services/fcm.service";

import SwiperCore, { Pagination } from 'swiper';
import { SwiperComponent } from "swiper/angular";
SwiperCore.use([ Pagination ]);

@Component({
  selector: 'auth-welcome-modal',
  templateUrl: './welcome.modal.html',
  styleUrls: ['./welcome.modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class WelcomeModal {
  @ViewChild('swiper') swiper: SwiperComponent;

  constructor(
    private fcm: FcmService,
    private modalCtrl: ModalController
  ) {}

  dismiss() {
    this.modalCtrl.dismiss()
  }

  // next() {
  //   this.swiper.swiperRef.slideNext(100)
  // }

  pushNotifications() {
    this.fcm.registerFCM()
    this.dismiss()
    // this.swiper.swiperRef.slideNext(100)
  }
}