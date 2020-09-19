import { Component, OnInit } from '@angular/core';
// Ionic
import { NavParams, ModalController } from '@ionic/angular';
// Interfaces
import { IGoalStakeholder } from '@strive/interfaces';

@Component({
  selector: 'app-choose-achiever-modal',
  templateUrl: './choose-achiever-modal.page.html',
  styleUrls: ['./choose-achiever-modal.page.scss'],
})
export class ChooseAchieverModalPage implements OnInit {

  public _achievers: IGoalStakeholder[]

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
  ) { }

  ngOnInit() {
    this._achievers = this.navParams.get('stakeholders')
  }

  async dismiss(): Promise<void> {
    await this.modalCtrl.dismiss()
  }

  async achieverChosen(achiever: IGoalStakeholder): Promise<void> {

    await this.modalCtrl.dismiss({
      receiverId: achiever.id,
      receiverUsername: achiever.username,
      receiverPhotoURL: achiever.photoURL
    })

  }

  // TODO: All supports can now only be given to one achiever. User should be able to SELECT the achievers (s)he wishes to receive supports
  // After that the supporter can decide which achiever will get which support
  // mb. drag and drop for pc; and multiple screens for phone users

  

}
