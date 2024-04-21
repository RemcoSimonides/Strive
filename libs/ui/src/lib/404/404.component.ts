import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CommonModule, Location } from '@angular/common'
import { RouterModule } from '@angular/router'
import { IonContent, IonButton } from '@ionic/angular/standalone'

import { SeoService } from '@strive/utils/services/seo.service'
import { HeaderComponent } from '../header/header.component'

@Component({
  standalone: true,
  selector: 'strive-404',
  templateUrl: './404.component.html',
  styleUrls: ['./404.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    IonContent,
    IonButton
  ]
})
export class PagenotfoundComponent {
  hasBack = false

  constructor(
    private location: Location,
    seo: SeoService
  ) {
    seo.generateTags({ title: `Page not found - Strive Journal` })

    const state = this.location.getState() as { navigationId: number }
    this.hasBack = state?.navigationId > 1
  }

  goBack() {
    this.location.back()
  }
}
