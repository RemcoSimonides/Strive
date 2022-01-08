import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ChooseAchieverModalComponent } from './choose-achiever-modal.page';
import { ImageModule } from '@strive/media/directives/image.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    ImageModule
  ],
  declarations: [ChooseAchieverModalComponent]
})
export class ChooseAchieverModalModule {}
