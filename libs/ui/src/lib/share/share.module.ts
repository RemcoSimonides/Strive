import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IonicModule } from '@ionic/angular';

import { ShareComponent } from './share.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FlexLayoutModule
  ],
  exports: [ShareComponent],
  declarations: [ShareComponent],
})
export class ShareModule { }
