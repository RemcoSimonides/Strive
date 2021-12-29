import { NgModule } from "@angular/core";
import { FlexLayoutModule } from '@angular/flex-layout';
import { IonicModule } from "@ionic/angular";

import { DatetimeComponent } from './datetime.component';

@NgModule({
  imports: [
    IonicModule,
    FlexLayoutModule
  ],
  declarations: [DatetimeComponent],
  exports: [DatetimeComponent]
})
export class DatetimeModule {}