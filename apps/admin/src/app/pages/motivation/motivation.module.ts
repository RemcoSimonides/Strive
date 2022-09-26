import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { MotivationComponent } from './motivation.component'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

const routes: Routes = [
  {
    path: '',
    component: MotivationComponent
  }
];


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PageLoadingModule
  ],
  declarations: [MotivationComponent],
  exports: [MotivationComponent]
})
export class MotivationModule {}