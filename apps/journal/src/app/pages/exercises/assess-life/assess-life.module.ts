import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { AssessLifeComponent } from './assess-life.component'

import { HeaderModule } from '@strive/ui/header/header.module'
import { AssessLifeEntryModule } from '@strive/exercises/assess-life/components/entry/assess-life-entry.module'
import { AssessLifeSettingsComponent } from './settings/assess-life-settings.component'
import { AssessLifeIntervalPipe } from '@strive/exercises/assess-life/pipes/interval.pipe'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

const routes: Routes = [
  {
    path: '',
    component: AssessLifeComponent
  },
  {
    path: 'settings',
    component: AssessLifeSettingsComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    HeaderModule,
    AssessLifeEntryModule,
    AssessLifeIntervalPipe,
    PageLoadingModule
  ],
  declarations: [AssessLifeComponent]
})
export class AssessLifeModule {}