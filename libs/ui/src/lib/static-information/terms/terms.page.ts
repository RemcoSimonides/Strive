import { CommonModule } from '@angular/common'
import { Component, NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { HeaderComponent } from '@strive/ui/header/header.component'
import { SeoService } from '@strive/utils/services/seo.service'
import { TermsModule } from './terms.module'
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
    IonContent,
    TermsModule,
    HeaderComponent,
    RouterModule.forChild([{ path: '', component: TermsPageComponent }])
  ],
  declarations: [TermsPageComponent]
})
export class TermsPageModule { }
