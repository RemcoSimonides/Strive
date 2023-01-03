import { NgModule } from '@angular/core'
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  { path: '', loadChildren: () => import('./pages/goals/goals.module').then(m => m.GoalsPageModule) },
  { path: 'explore', loadChildren: () => import('./pages/explore/explore.module').then(m => m.ExplorePageModule) },
  { path: 'goals', loadChildren: () => import('./pages/goals/goals.module').then(m => m.GoalsPageModule) },
  { path: 'goal/:id', loadChildren: () => import('./pages/goal/goal.module').then(m => m.GoalPageModule) },
  { path: 'notifications', loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsPageModule) },
  { path: 'supports', loadChildren: () => import('./pages/supports/supports.module').then(m => m.SupportsPageModule) },
  { path: 'supports/:id', loadChildren: () => import('./pages/supports/support/support.module').then(m => m.SupportPageModule) },
  { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule) },
  { path: 'profile/:id', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule) },
  { path: 'settings', loadChildren: () => import('./pages//settings/settings.module').then(m => m.SettingsPageModule)},
  { path: 'terms', loadChildren: () => import('@strive/ui/static-information/terms/terms.page').then(m => m.TermsPageModule) },
  { path: 'privacy-policy', loadChildren: () => import('@strive/ui/static-information/privacy/privacy-policy.page').then(m => m.PrivacyPolicyPageModule) },
  { path: 'edit-profile', loadChildren: () => import('./pages/profile/edit-profile/edit-profile.module').then(m => m.EditProfilePageModule) },
  { path: 'exercise', loadChildren: () => import('./pages/exercises/exercises.module').then(m => m.ExercisesModule) },
  { path: 'download', loadChildren: () => import('./pages/download/download.module').then(m => m.DownloadModule) },
  { path: '**', pathMatch: 'full', loadChildren: () => import('./pages/404/404.module').then(m => m.NotfoundPageModule) },
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    initialNavigation: 'enabledBlocking'
})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
