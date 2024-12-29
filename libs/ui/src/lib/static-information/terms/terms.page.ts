import { Component } from '@angular/core'
import { HeaderComponent } from '@strive/ui/header/header.component'
import { SeoService } from '@strive/utils/services/seo.service'
import { TermsComponent } from './terms.component'
import { IonContent } from '@ionic/angular/standalone'

@Component({
    selector: 'strive-terms-page',
    template: `
    <strive-header title="Terms of Service"></strive-header>
    <ion-content>
      <strive-terms></strive-terms>
    </ion-content>
  `,
    styles: [
        `strive-terms {
      display: block;
      max-width: var(--page-max-width);
      margin: auto;
      padding: 0 16px;
    }`
    ],
    imports: [
        IonContent,
        TermsComponent,
        HeaderComponent
    ]
})
export class TermsPageComponent {
  constructor(seo: SeoService) {
    seo.generateTags({ title: `Terms - Strive Journal` })
  }
}
