import { CommonModule } from "@angular/common";
import { Component, NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { SeoService } from "@strive/utils/services/seo.service";
import { TermsModule } from "./terms.module";

@Component({
  selector: 'strive-terms-page',
  template: `
    <ion-content>
      <strive-terms></strive-terms>
    </ion-content>
  `,
  styles: [
    `strive-terms {
      display: block;
      max-width: 700px;
      margin: auto;
      padding: 0 16px;
    }`
  ]
})
export class TermsPage {
  constructor(seo: SeoService) {
    seo.generateTags({ title: `Terms - Strive Journal` })
  }
}

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TermsModule,
    RouterModule.forChild([{ path: '', component: TermsPage }])
  ],
  declarations: [TermsPage]
})
export class TermsPageModule { }