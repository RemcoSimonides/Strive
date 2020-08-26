import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  { path: '', redirectTo: 'explore', pathMatch: 'full' },
  { path: 'explore', loadChildren: () => import('./pages/explore/explore.module').then(m => m.ExplorePageModule) },
  { path: 'goals', loadChildren: () => import('./pages/goals/goals.module').then(m => m.GoalsPageModule) },
  { path: 'goal/:id', loadChildren: () => import('./pages/goal/goal.module').then(m => m.GoalPageModule) },
  { path: 'collective-goal/:id', loadChildren: () => import('./pages/collective-goal/collective-goal.module').then(m => m.CollectiveGoalPageModule), },
  // { path: 'notifications', loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsPageModule) },
  // { path: 'supports', loadChildren: () => import('./pages/supports/supports.module').then(m => m.SupportsPageModule) },
  { path: 'profile/:id', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule) },
  // { path: 'terms', loadChildren: () => import('./pages/terms/terms.module').then(m => m.TermsPageModule) },
  // { path: 'download', loadChildren: () => import('./pages/download/download.module').then( m => m.DownloadPageModule) },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
