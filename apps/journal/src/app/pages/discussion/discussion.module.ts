import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DiscussionPageRoutingModule } from './discussion-routing.module';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DiscussionPageRoutingModule,
    ComponentsModule
  ],
  declarations: [],
})
export class DiscussionPageModule {}
