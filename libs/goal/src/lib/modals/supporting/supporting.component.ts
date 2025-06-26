import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core'
import { Router } from '@angular/router'

import { IonTitle, IonContent, IonList, IonItem, IonThumbnail, IonLabel } from '@ionic/angular/standalone'

import { Goal } from '@strive/model'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@Component({
    selector: 'strive-goal-supporting',
    templateUrl: 'supporting.component.html',
    styleUrls: ['./supporting.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ImageDirective,
        HeaderModalComponent,
        IonTitle,
        IonContent,
        IonList,
        IonItem,
        IonThumbnail,
        IonLabel
    ]
})
export class SupportingComponent extends ModalDirective {
  private router = inject(Router);

  @Input() goals: Goal[] = []

  constructor() {
    super()
  }

  navTo(id: string) {
    const path = ['/goal', id]
    this.navigateTo(this.router, path)
  }
}
