import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { Location } from '@angular/common'
import { ModalController, Platform } from '@ionic/angular'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { StakeholderWithGoalAndEvents } from '@strive/model'

@Component({
  selector: '[stakeholder] goal-updates',
  templateUrl: 'goal-updates.component.html',
  styleUrls: ['./goal-updates.component.scss']
})
export class GoalUpdatesModalComponent extends ModalDirective {
  
  @Input() stakeholder!: StakeholderWithGoalAndEvents

  constructor(
    protected override location: Location,
    protected override modalCtrl: ModalController,
    protected override platform: Platform,
    private router: Router,
  ) {
    super(location, modalCtrl, platform)
  }

  navigateTo(id: string) {
    this.router.navigateByUrl(`goal/${id}`)
    this.modalCtrl.dismiss()
  }

}
