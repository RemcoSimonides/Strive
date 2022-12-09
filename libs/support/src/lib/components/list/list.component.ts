import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { Support, SupportsGroupedByGoal } from '@strive/model'
import { SupportDetailsModalComponent } from '@strive/support/modals/details/details.component'

@Component({
  selector: 'support-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportListComponent {
  @Input() goal?: SupportsGroupedByGoal

  @Input() showAll = false
  showAmount = 3

  @ContentChild('goal') goalDescription?: TemplateRef<unknown>
  @ContentChild('milestone') milestoneDescription?: TemplateRef<unknown>
  @ContentChild('empty') emptyDescription?: TemplateRef<unknown>

  constructor(private modalCtrl: ModalController) {}

  trackBySupport(index: number, support: Support) {
    return support.id
  }

  openDetails(support: Support) {
    this.modalCtrl.create({
      component: SupportDetailsModalComponent,
      componentProps: { support }
    }).then(modal => modal.present())
  }
}