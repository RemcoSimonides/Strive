import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ShellComponent } from './shell.component';
import { StriveAdminGuard } from '../guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'users',
        loadChildren: () => import('../pages/users/users.module').then(m => m.UsersPageModule),
        canActivate: [StriveAdminGuard]
      },
      {
        path: 'goals',
        loadChildren: () => import('../pages/goals/goals.module').then(m => m.GoalsPageModule),
        canActivate: [StriveAdminGuard]
      },
      // {
      //   path: 'collective-goals',
      //   loadChildren: () => import('../pages/collective-goals/collective-goals.module').then(m => m.CollectiveGoalsPageModule),
      //   canActivate: [StriveAdminGuard]
      // }
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
