import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ChatModalPage } from './chat-modal.component';

import { ComponentsModule } from 'apps/journal/src/app/components/components.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    ComponentsModule
  ],
  declarations: [
    ChatModalPage
  ],
})
export class ChatModalModule {}
