import { Component, Input, inject } from '@angular/core'
import { Router } from '@angular/router'
import { Location } from '@angular/common'

import { IonContent, IonIcon, ModalController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { lockClosedOutline, shield, flag, star } from 'ionicons/icons'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { StakeholderWithGoalAndEvents } from '@strive/model'
import { GoalThumbnailComponent } from '@strive/goal/components/thumbnail/thumbnail.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@Component({
    selector: '[stakeholder] strive-goal-updates',
    templateUrl: 'goal-updates.component.html',
    styleUrls: ['./goal-updates.component.scss'],
    imports: [
        GoalThumbnailComponent,
        HeaderModalComponent,
        IonContent,
        IonIcon
    ]
})
export class GoalUpdatesModalComponent extends ModalDirective {
  private router = inject(Router);


  @Input() stakeholder!: StakeholderWithGoalAndEvents

  constructor() {
    super()

    addIcons({ lockClosedOutline, shield, flag, star })
  }

  navTo(id: string) {
    const path = [`/goal`, id]
    this.navigateTo(this.router, path)
  }

}
