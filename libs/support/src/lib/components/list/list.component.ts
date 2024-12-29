import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core'

import { IonList, IonItem, IonLabel, IonButton, IonIcon, ModalController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { chevronDownOutline } from 'ionicons/icons'

import { Milestone, Support, SupportsGroupedByGoal } from '@strive/model'
import { SupportDetailsModalComponent } from '@strive/support/modals/details/details.component'
import { PledgeComponent } from '../pledge/pledge.component'
import { SupportDecisionComponent } from '../decision/decision.component'
import { SupportCounterPipe, SupportTotalPipe, NeedsDecisionPipe } from '@strive/support/pipes/count.pipe'
import { IsRecipientPipe, IsSupporterPipe } from '@strive/support/pipes/role.pipe'

@Component({
    selector: 'strive-support-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        PledgeComponent,
        SupportDecisionComponent,
        SupportCounterPipe, SupportTotalPipe, NeedsDecisionPipe,
        IsRecipientPipe, IsSupporterPipe,
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
