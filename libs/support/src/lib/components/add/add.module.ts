import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AddSupportModalComponent } from './add.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SupportOptionsModule } from '../options/options.module';
import { ImageModule } from '@strive/media/directives/image.module';
import { SupportStatusPipeModule } from '@strive/support/pipes/status.pipe'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    FontAwesomeModule,
    ImageModule,
    FlexLayoutModule,
    SupportOptionsModule,
    SupportStatusPipeModule
  ],
  declarations: [
    AddSupportModalComponent
  ]
})
export class AddSupportModalModule {}
