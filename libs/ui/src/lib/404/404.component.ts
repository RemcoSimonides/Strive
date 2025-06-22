import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { Location } from '@angular/common'
import { RouterModule } from '@angular/router'
import { IonContent, IonButton } from '@ionic/angular/standalone'

import { SeoService } from '@strive/utils/services/seo.service'
import { HeaderComponent } from '../header/header.component'

@Component({
    selector: 'strive-404',
    templateUrl: './404.component.html',
    styleUrls: ['./404.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RouterModule,
        HeaderComponent,
        IonContent,
        IonButton
    ]
})
export class PagenotfoundComponent {
  private location = inject(Location);

  hasBack = false

  constructor() {
    const seo = inject(SeoService);

    seo.generateTags({ title: `Page not found - Strive Journal` })

    const state = this.location.getState() as { navigationId: number }
    this.hasBack = state?.navigationId > 1
  }

  goBack() {
    this.location.back()
  }
}
