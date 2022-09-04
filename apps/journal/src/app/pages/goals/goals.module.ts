import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Routes, RouterModule } from '@angular/router'
import { FlexLayoutModule } from '@angular/flex-layout'
import { ReactiveFormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { GoalsComponent } from './goals.page'

// Strive
import { HeaderRootModule } from '@strive/ui/header-root/header-root.module'
import { UpsertGoalModalModule } from '@strive/goal/goal/components/upsert/upsert.module'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { ProgressPipeModule } from '@strive/goal/goal/pipes/progress.pipe'
import { ImageModule } from '@strive/media/directives/image.module'
import { GoalOptionsModule } from '@strive/goal/goal/components/goal-options/goal-options.module'
import { OptionsPopoverModule } from './options/options.module'
import { HomePageModule } from '../home/home.module'

const routes: Routes = [
  {
    path: '',
    component: GoalsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FlexLayoutModule,
    RouterModule.forChild(routes),
    PageLoadingModule,
    HeaderRootModule,
    UpsertGoalModalModule,
    ImageModule,
    GoalOptionsModule,
    HomePageModule,
    OptionsPopoverModule,
    ReactiveFormsModule,
    ProgressPipeModule
  ],
  declarations: [GoalsComponent]
})
export class GoalsPageModule {}
