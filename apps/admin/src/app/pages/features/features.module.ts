import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { FeaturesComponent } from './features.component';

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';

const routes: Routes = [
  {
    path: '',
    component: FeaturesComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    RouterModule.forChild(routes),
    PageLoadingModule
  ],
  declarations: [FeaturesComponent],
  exports: [FeaturesComponent]
})
export class FeaturesModule {}