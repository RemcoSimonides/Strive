import { Component, HostListener, OnInit } from '@angular/core';
// Ionic
import { NavParams, ModalController } from '@ionic/angular';
// Interfaces
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { createProfileLink } from '@strive/user/user/+state/user.firestore';

@Component({
  selector: 'app-choose-achiever-modal',
  templateUrl: './choose-achiever-modal.page.html',
  styleUrls: ['./choose-achiever-modal.page.scss'],
})
export class ChooseAchieverModal implements OnInit {
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    // would be nice to prevent the navigation too
    this.modalCtrl.dismiss()
  }

  public achievers: GoalStakeholder[]

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams
  ) { }

  ngOnInit() {
    this.achievers = this.navParams.get('stakeholders')
  }

  dismiss() {
    this.modalCtrl.dismiss()
  }

  achieverChosen(achiever: GoalStakeholder) {
    const receiver = createProfileLink(achiever)
    this.modalCtrl.dismiss(receiver)
  }

  // TODO: All supports can now only be given to one achiever. User should be able to SELECT the achievers (s)he wishes to receive supports
  // After that the supporter can decide which achiever will get which support
  // mb. drag and drop for pc; and multiple screens for phone users

}
