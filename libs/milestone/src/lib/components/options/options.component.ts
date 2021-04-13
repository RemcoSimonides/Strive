import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
// Services
import { MilestoneService } from '@strive/milestone/+state/milestone.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import { Milestone } from '@strive/milestone/+state/milestone.firestore'
import { createProfileLink } from '@strive/user/user/+state/user.firestore';

@Component({
  selector: 'milestone-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class MilestoneOptionsPopover implements OnInit {

  goalId: string
  milestone: Milestone

  isNotCompleted: boolean
  isAlreadyAssigned: boolean

  constructor(
    private user: UserService,
    private milestoneService: MilestoneService,
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) { }

  async ngOnInit() {
    this.goalId = this.navParams.get('goalId')
    this.milestone = this.navParams.get('milestone')

    this.isAlreadyAssigned = this.milestone.achiever.uid === this.user.uid
    this.isNotCompleted = this.milestone.status === 'pending' || this.milestone.status === 'overdue'
  }

  dismiss(data) {
    this.popoverCtrl.dismiss(data)
  }

  async assignMe() {
    const currentUser = await this.user.getFirebaseUser();
    this.milestone.achiever = createProfileLink({
      username: currentUser.displayName,
      photoURL: currentUser.photoURL,
      uid: currentUser.uid
    })
    await this.milestoneService.upsert({ achiever: this.milestone.achiever, id: this.milestone.id }, { params: { goalId: this.goalId }})
    this.dismiss(this.milestone)
  }

  async unassignMe() {
    this.milestone.achiever = createProfileLink()
    await this.milestoneService.upsert({ achiever: this.milestone.achiever, id: this.milestone.id }, { params: { goalId: this.goalId }})
    this.dismiss(this.milestone)
  }

}
