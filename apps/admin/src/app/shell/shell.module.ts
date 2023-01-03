import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { ShellComponent } from './shell.component'

const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('../pages/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'users',
        loadChildren: () => import('../pages/users/users.module').then(m => m.UsersPageModule)
      },
      {
        path: 'goals',
        loadChildren: () => import('../pages/goals/goals.module').then(m => m.GoalsPageModule)
      },
      {
        path: 'motivation',
        loadChildren: () => import('../pages/motivation/motivation.module').then(m => m.MotivationModule)
      },
      {
        path: 'features',
        loadChildren: () => import('../pages/features/features.module').then(m => m.FeaturesModule)
      }
    ]
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  exports: [],
  declarations: [ShellComponent],
  providers: [],
})
export class ShellModule { }
