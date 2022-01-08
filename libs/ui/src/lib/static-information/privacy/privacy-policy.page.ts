import { CommonModule } from "@angular/common";
import { Component, NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { SeoService } from "@strive/utils/services/seo.service";
import { PrivacyPolicyModule } from "./privacy-policy.module";

@Component({
  selector: 'strive-privacy-policy-page',
  template: `
    <ion-content>
      <strive-privacy-policy></strive-privacy-policy>
    </ion-content>
  `,
  styles: [
    `strive-privacy-policy {
      display: block;
      max-width: 700px;
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
    RouterModule.forChild([{ path: '', component: PrivacyPolicyPageComponent }])
  ],
  declarations: [PrivacyPolicyPageComponent]
})
export class PrivacyPolicyPageModule { }