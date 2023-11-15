import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { SelfReflectComponent } from './self-reflect.component'

import { HeaderModule } from '@strive/ui/header/header.module'
import { SelfReflectEntryModule } from '@strive/exercises/self-reflect/components/entry/self-reflect-entry.module'
import { SelfReflectSettingsComponent } from './settings/self-reflect-settings.component'
import { SelfReflectFrequencyPipe } from '@strive/exercises/self-reflect/pipes/frequency.pipe'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

const routes: Routes = [
  {
    path: '',
    component: SelfReflectComponent
  },
  {
    path: 'settings',
    component: SelfReflectSettingsComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    HeaderModule,
    SelfReflectEntryModule,
    SelfReflectFrequencyPipe,
    PageLoadingModule
  ],
  declarations: [SelfReflectComponent]
})
export class SelfReflectModule {}