import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AddSupportModalComponent } from './add.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ImageModule } from '@strive/media/directives/image.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    FontAwesomeModule,
    ImageModule,
    FlexLayoutModule
  ],
  declarations: [
    AddSupportModalComponent
  ]
})
export class AddSupportModalModule {}
