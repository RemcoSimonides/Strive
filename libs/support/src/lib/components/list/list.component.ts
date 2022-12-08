import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core'
import { Support, SupportsGroupedByGoal } from '@strive/model'

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

  trackBySupport(index: number, support: Support) {
    return support.id
  }
}