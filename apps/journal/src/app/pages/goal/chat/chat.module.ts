import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

import { ChatComponent } from './chat.component'

import { ImageModule } from '@strive/media/directives/image.module';
import { TimeAgoPipeModule } from '@strive/utils/pipes/time-ago.pipe';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    FlexLayoutModule,
    ImageModule,
    TimeAgoPipeModule
  ],
  declarations: [
    ChatComponent
  ],
  exports: [
    ChatComponent
  ]
})
export class ChatModule {}
