import { CommonModule } from "@angular/common";
import { Component, NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { HeaderModule } from "@strive/ui/header/header.module";
import { SeoService } from "@strive/utils/services/seo.service";
import { TermsModule } from "./terms.module";

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
  ]
})
export class TermsPageComponent {
  constructor(seo: SeoService) {
    seo.generateTags({ title: `Terms - Strive Journal` })
  }
}

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TermsModule,
    HeaderModule,
    RouterModule.forChild([{ path: '', component: TermsPageComponent }])
  ],
  declarations: [TermsPageComponent]
})
export class TermsPageModule { }