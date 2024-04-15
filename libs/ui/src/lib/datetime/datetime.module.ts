import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { DatetimeComponent } from './datetime.component'
import { IonDatetime, IonButton } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    IonDatetime,
    IonButton
  ],
  declarations: [DatetimeComponent],
  exports: [DatetimeComponent]
})
export class DatetimeModule { }
