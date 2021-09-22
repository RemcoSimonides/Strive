import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    loadChildren: () => import('./users/users.module').then(m => m.UsersPageModule)
  },
  {
    path: 'goals',
    loadChildren: () => import('./goals/goals.module').then(m => m.GoalsPageModule)
  },
  {
    path: 'collective-goals',
    loadChildren: () => import('./collective-goals/collective-goals.module').then(m => m.CollectiveGoalsPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
