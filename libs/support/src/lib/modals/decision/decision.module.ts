import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SupportDecisionComponent } from './decision.component';
import { AchieversPopoverModule } from './achievers/achievers.module';

import { ImageModule } from '@strive/media/directives/image.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ImageModule,
    FlexLayoutModule,
    AchieversPopoverModule
  ],
  declarations: [SupportDecisionComponent]
})
export class SupportDecisionModal {}