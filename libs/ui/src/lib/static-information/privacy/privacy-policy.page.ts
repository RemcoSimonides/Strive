import { CommonModule } from "@angular/common"
import { Component, NgModule } from "@angular/core"
import { RouterModule } from "@angular/router"
import { IonicModule } from "@ionic/angular"
import { HeaderModule } from "@strive/ui/header/header.module"
import { SeoService } from "@strive/utils/services/seo.service"
import { PrivacyPolicyModule } from "./privacy-policy.module"

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
  ]
})
export class PrivacyPolicyPageComponent {
  constructor(seo: SeoService) {
    seo.generateTags({ title: `Privacy Policy - Strive Journal` })
  }
}

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PrivacyPolicyModule,
    HeaderModule,
    RouterModule.forChild([{ path: '', component: PrivacyPolicyPageComponent }])
  ],
  declarations: [PrivacyPolicyPageComponent]
})
export class PrivacyPolicyPageModule { }