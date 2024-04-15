import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { Location } from '@angular/common'
import { ModalController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { lockClosedOutline, shield, flag, star } from 'ionicons/icons'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { StakeholderWithGoalAndEvents } from '@strive/model'

@Component({
  selector: '[stakeholder] strive-goal-updates',
  templateUrl: 'goal-updates.component.html',
  styleUrls: ['./goal-updates.component.scss']
})
export class GoalUpdatesModalComponent extends ModalDirective {

  @Input() stakeholder!: StakeholderWithGoalAndEvents

  constructor(
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private router: Router,
  ) {
    super(location, modalCtrl)
    addIcons({ lockClosedOutline, shield, flag, star })
  }

  navTo(id: string) {
    const path = [`/goal`, id]
    this.navigateTo(this.router, path)
  }

}
