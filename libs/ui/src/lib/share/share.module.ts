import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IonicModule } from '@ionic/angular';

import { ShareComponent } from './share.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FontAwesomeModule,
    ShareButtonsModule,
    FlexLayoutModule
  ],
  exports: [ShareComponent],
  declarations: [ShareComponent],
})
export class ShareModule { }
