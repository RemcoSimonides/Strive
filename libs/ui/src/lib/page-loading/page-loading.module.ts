import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { PageLoadingComponent } from './page-loading.component'
import { IonSpinner } from '@ionic/angular/standalone'

@NgModule({
  declarations: [PageLoadingComponent],
  imports: [
    CommonModule,
    IonSpinner
  ],
  exports: [PageLoadingComponent]
})
export class PageLoadingModule { }
