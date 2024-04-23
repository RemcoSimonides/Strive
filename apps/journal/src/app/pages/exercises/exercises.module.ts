import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { ExercisesPageComponent, GetExercisePipe } from './exercises.component'

import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'

import { SmallThumbnailComponent } from '@strive/ui/thumbnail/components/small/small-thumbnail.component'
import { HeaderRootComponent } from '@strive/ui/header-root/header-root.component'
import { NextLetterPipe } from '@strive/exercises/dear-future-self/pipes/dear-future-self.pipe'
import { TimeToGoPipe } from '@strive/utils/pipes/time-to-go.pipe'
import { IonContent, IonIcon } from '@ionic/angular/standalone'

const routes: Routes = [
  {
    path: '',
    component: ExercisesPageComponent,
  },
  {
    path: 'affirmations',
    loadComponent: () => import('./affirmations/affirmations.component').then(m => m.AffirmationsPageComponent)
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
    path: 'self-reflect',
    loadChildren: () => import('./self-reflect/self-reflect.module').then(m => m.SelfReflectModule)
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SmallThumbnailComponent,
    HeaderRootComponent,
    NextLetterPipe,
    TimeToGoPipe,
    PageLoadingComponent,
    IonContent,
    IonIcon
  ],
  declarations: [
    ExercisesPageComponent,
    GetExercisePipe
  ]
})
export class ExercisesModule {}