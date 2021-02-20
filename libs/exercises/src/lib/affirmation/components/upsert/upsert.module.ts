import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AffirmationUpsertComponent } from './upsert.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [],
  declarations: [AffirmationUpsertComponent],
})
export class AffirmationUpsertModule { }
