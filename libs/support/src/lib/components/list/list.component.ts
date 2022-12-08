import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { Support, SupportsGroupedByGoal } from '@strive/model'
import { SupportDetailsComponent } from '@strive/support/modals/details/details.component'

@Component({
  selector: 'support-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportListComponent {
  @Input() goal?: SupportsGroupedByGoal

  @ContentChild('goal') goalDescription?: TemplateRef<unknown>
  @ContentChild('milestone') milestoneDescription?: TemplateRef<unknown>

  constructor(private modalCtrl: ModalController) {}

  trackBySupport(index: number, support: Support) {
    return support.id
  }

  openDetails(support: Support) {
    this.modalCtrl.create({
      component: SupportDetailsComponent,
      componentProps: { support }
    }).then(modal => modal.present())
  }
}