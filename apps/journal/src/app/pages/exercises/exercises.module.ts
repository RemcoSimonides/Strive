import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { ExercisesComponent } from './exercises.component';

import { SmallThumbnailModule } from '@strive/ui/thumbnail/components/small/small-thumbnail.module';

const routes: Routes = [
  {
    path: '',
    component: ExercisesComponent,
  },
  {
    path: 'affirmations',
    loadChildren: () => import('./affirmations/affirmations.module').then(m => m.AffirmationsModule)
  },
  {
    path: 'daily-gratefulness',
    loadChildren: () => import('./daily-gratefulness/daily-gratefulness.module').then(m => m.DailyGratefulnessModule)
  },
  {
    path: 'assess-life',
    loadChildren: () => import('./assess-life/assess-life.module').then(m => m.AssessLifeModule)
  },
  {
    path: 'dear-future-self',
    loadChildren: () => import('./dear-future-self/dear-future-self.module').then(m => m.DearFutureSelfModule)
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    SmallThumbnailModule
  ],
  declarations: [ExercisesComponent]
})
export class ExercisesModule {}