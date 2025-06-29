import { Component, inject } from '@angular/core'
import { HeaderComponent } from '@strive/ui/header/header.component'
import { SeoService } from '@strive/utils/services/seo.service'
import { PrivacyPolicyComponent } from './privacy-policy.component'
import { IonContent } from '@ionic/angular/standalone'

@Component({
    selector: 'strive-privacy-policy-page',
    template: `
    <strive-header title="Privacy Policy"></strive-header>
    <ion-content>
      <strive-privacy-policy></strive-privacy-policy>
    </ion-content>
  `,
    styles: [
        `strive-privacy-policy {
      display: block;
      max-width: var(--page-max-width);
      margin: auto;
      padding: 0 16px;
    }`
    ],
    imports: [
        IonContent,
        PrivacyPolicyComponent,
        HeaderComponent
    ]
})
export class PrivacyPolicyPageComponent {

  constructor() {
    const seo = inject(SeoService);

    seo.generateTags({ title: `Privacy Policy - Strive Journal` })
  }
}