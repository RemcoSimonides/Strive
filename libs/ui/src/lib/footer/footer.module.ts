import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { FooterComponent } from './footer.component'
import { IonIcon } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonIcon
  ],
  declarations: [
    FooterComponent
  ],
  exports: [
    FooterComponent
  ]
})
export class FooterModule { }
