import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IonicModule } from '@ionic/angular';

import { AffirmationsComponent } from './view.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    IonicModule
  ],
  exports: [AffirmationsComponent],
  declarations: [AffirmationsComponent],
})
export class AffirmationsViewModule { }
