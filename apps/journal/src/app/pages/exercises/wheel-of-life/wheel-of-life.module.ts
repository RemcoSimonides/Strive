import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { WheelOfLifePageComponent } from './wheel-of-life.component'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { AuthModalModule } from '@strive/auth/components/auth-modal/auth-modal.module'
import { HeaderModule } from '@strive/ui/header/header.module'

import { WheelOfLifeEntryModule } from '@strive/exercises/wheel-of-life/components/entry/entry.module'
import { EntryModalModule } from '@strive/exercises/wheel-of-life/modals/entry/entry.module'
import { WheelOfLifeResultsModule } from '@strive/exercises/wheel-of-life/components/results/results.module'
import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'

import { EntryPipeModule } from '@strive/exercises/wheel-of-life/pipes/entry.pipe'

const routes: Routes = [
  {
    path: '',
    component: WheelOfLifePageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    PageLoadingModule,
    AuthModalModule,
    HeaderModule,
    WheelOfLifeEntryModule,
    EntryModalModule,
    WheelOfLifeResultsModule,
    EntryPipeModule,
    GoalCreateModalComponent
  ],
  declarations: [WheelOfLifePageComponent]
})
export class WheelOfLifeModule {}