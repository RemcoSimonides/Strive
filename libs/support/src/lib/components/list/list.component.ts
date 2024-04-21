import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core'

import { IonList, IonItem, IonLabel, IonButton, IonIcon, ModalController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { chevronDownOutline } from 'ionicons/icons'

import { Milestone, Support, SupportsGroupedByGoal } from '@strive/model'
import { SupportDetailsModalComponent } from '@strive/support/modals/details/details.component'
import { PledgeComponent } from '../pledge/pledge.component'
import { MilestonePathPipeModule } from '@strive/roadmap/pipes/path.pipe'
import { SupportDecisionComponent } from '../decision/decision.component'
import { SupportDetailsModalModule } from '@strive/support/modals/details/details.module'
import { SupportCounterPipeModule } from '@strive/support/pipes/count.pipe'
import { SupportRolePipeModule } from '@strive/support/pipes/role.pipe'

@Component({
  standalone: true,
  selector: 'strive-support-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    PledgeComponent,
    MilestonePathPipeModule,
    SupportDecisionComponent,
    SupportDetailsModalModule,
    SupportCounterPipeModule,
    SupportRolePipeModule,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon
  ]
})
export class SupportListComponent {
  @Input() goal?: SupportsGroupedByGoal

  @Input() showAll = false
  showAmount = 3

  @ContentChild('goal') goalDescription?: TemplateRef<unknown>
  @ContentChild('milestone') milestoneDescription?: TemplateRef<unknown>

  constructor(private modalCtrl: ModalController) {
    addIcons({ chevronDownOutline })
  }

  trackBy(index: number, object: Support | Milestone) {
    return object.id
  }

  openDetails(support: Support) {
    this.modalCtrl.create({
      component: SupportDetailsModalComponent,
      componentProps: { support }
    }).then(modal => modal.present())
  }
}
