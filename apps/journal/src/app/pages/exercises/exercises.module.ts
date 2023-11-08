import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { ExercisesPageComponent, GetExercisePipe, AssessLifeDescriptionPipe } from './exercises.component'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

import { SmallThumbnailModule } from '@strive/ui/thumbnail/components/small/small-thumbnail.module'
import { HeaderRootModule } from '@strive/ui/header-root/header-root.module'
import { DearFutureSelfPipeModule } from '@strive/exercises/dear-future-self/pipes/dear-future-self.pipe'
import { TimeToGoPipeModule } from '@strive/utils/pipes/time-to-go.pipe'

const routes: Routes = [
  {
    path: '',
    component: ExercisesPageComponent,
  },
  {
    path: 'affirmations',
    loadChildren: () => import('./affirmations/affirmations.module').then(m => m.AffirmationsModule)
  },
  {
    path: 'daily-gratitude',
    loadChildren: () => import('./daily-gratitude/daily-gratitude.module').then(m => m.DailyGratitudeModule)
  },
  {
    path: 'wheel-of-life',
    loadChildren: () => import('./wheel-of-life/wheel-of-life.module').then(m => m.WheelOfLifeModule)
  },
  {
    path: 'dear-future-self',
    loadChildren: () => import('./dear-future-self/dear-future-self.module').then(m => m.DearFutureSelfModule)
  },
  {
    path: 'assess-life',
    loadChildren: () => import('./assess-life/assess-life.module').then(m => m.AssessLifeModule)
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    SmallThumbnailModule,
    HeaderRootModule,
    DearFutureSelfPipeModule,
    TimeToGoPipeModule,
    PageLoadingModule,
    AssessLifeDescriptionPipe
  ],
  declarations: [
    ExercisesPageComponent,
    GetExercisePipe
  ]
})
export class ExercisesModule {}