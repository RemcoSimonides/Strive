import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AchieversModalComponent } from './achievers.component';
import { ImageModule } from '@strive/media/directives/image.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    ImageModule
  ],
  declarations: [AchieversModalComponent]
})
export class AchieversModalModule {}