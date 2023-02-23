import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { Location } from '@angular/common'
import { ModalController } from '@ionic/angular'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { Goal } from '@strive/model'

@Component({
  selector: 'strive-goal-supporting',
  templateUrl: 'supporting.component.html',
  styleUrls: ['./supporting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportingComponent extends ModalDirective {
  
  @Input() goals: Goal[] = []

  constructor(
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private router: Router,
  ) {
    super(location, modalCtrl)
  }

  navTo(id: string) {
    const path = ['/goal', id]
    this.navigateTo(this.router, path)
  }
}