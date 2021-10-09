import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { IonicModule } from '@ionic/angular';

import { EditRoadmapComponent } from './edit-roadmap.component';


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    IonicModule
  ],
  declarations: [EditRoadmapComponent],
  exports: [EditRoadmapComponent]
})
export class EditRoadmapModule {}
