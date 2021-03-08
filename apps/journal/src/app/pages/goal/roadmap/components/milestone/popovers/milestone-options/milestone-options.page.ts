import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
// Services
import { MilestoneService } from '@strive/milestone/+state/milestone.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import { Milestone } from '@strive/milestone/+state/milestone.firestore'
import { createProfileLink } from '@strive/user/user/+state/user.firestore';

@Component({
  selector: 'app-milestone-options',
  templateUrl: './milestone-options.page.html',
  styleUrls: ['./milestone-options.page.scss'],
})
export class MilestoneOptionsPage implements OnInit {

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

  complete() {
    this.dismiss({
      statusChange: true
    })
  }

  setDeadline() {
    this.dismiss({
      setDeadline: true
    })
  }

  removeDeadline() {
    this.dismiss({
      removeDeadline: true
    })
  }

  async assignMe() {
    const currentUser = await this.user.getFirebaseUser();
    this.milestone.achiever = createProfileLink({
      username: currentUser.displayName,
      photoURL: currentUser.photoURL,
      uid: currentUser.uid
    })
    await this.milestoneService.upsert(this.goalId, this.milestone.id, { achiever: this.milestone.achiever })
    this.dismiss(this.milestone)
  }

  async unassignMe() {
    this.milestone.achiever = createProfileLink()
    await this.milestoneService.upsert(this.goalId, this.milestone.id, { achiever: this.milestone.achiever})
    this.dismiss(this.milestone)
  }

}
