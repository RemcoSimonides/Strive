import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
// Ionic
import { NavParams, ModalController } from '@ionic/angular';
// Interfaces
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { createUserLink } from '@strive/user/user/+state/user.firestore';
import { ModalDirective } from '@strive/utils/directives/modal.directive';

@Component({
  selector: 'notification-choose-achiever-modal',
  templateUrl: './choose-achiever-modal.page.html',
  styleUrls: ['./choose-achiever-modal.page.scss'],
})
export class ChooseAchieverModalComponent extends ModalDirective implements OnInit {
  achievers: GoalStakeholder[]

  constructor(
    protected modalCtrl: ModalController,
    protected location: Location,
    private navParams: NavParams
  ) {
    super(location, modalCtrl)
  }

  ngOnInit() {
    this.achievers = this.navParams.get('stakeholders')
  }

  achieverChosen(achiever: GoalStakeholder) {
    const receiver = createUserLink(achiever)
    this.modalCtrl.dismiss(receiver)
  }

  // TODO: All supports can now only be given to one achiever. User should be able to SELECT the achievers (s)he wishes to receive supports
  // After that the supporter can decide which achiever will get which support
  // mb. drag and drop for pc; and multiple screens for phone users

}
