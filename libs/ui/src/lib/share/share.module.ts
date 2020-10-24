import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { ShareComponent } from './share.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FontAwesomeModule
  ],
  exports: [ShareComponent],
  declarations: [ShareComponent],
})
export class ShareModule { }
