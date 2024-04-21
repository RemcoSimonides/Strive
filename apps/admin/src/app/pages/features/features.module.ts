import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { FeaturesComponent } from './features.component'

import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'

const routes: Routes = [
  {
    path: '',
    component: FeaturesComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    PageLoadingComponent
  ],
  declarations: [FeaturesComponent],
  exports: [FeaturesComponent]
})
export class FeaturesModule {}