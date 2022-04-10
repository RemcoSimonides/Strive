import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('./pages/feed/feed.module').then(m => m.FeedPageModule) },
  { path: 'feed', loadChildren: () => import('./pages/feed/feed.module').then(m => m.FeedPageModule) },
  { path: 'explore', loadChildren: () => import('./pages/explore/explore.module').then(m => m.ExplorePageModule) },
  { path: 'goals', loadChildren: () => import('./pages/goals/goals.module').then(m => m.GoalsPageModule) },
  { path: 'goal/:id', loadChildren: () => import('./pages/goal/goal-view/goal-view.module').then(m => m.GoalViewPageModule) },
  { path: 'collective-goal/:id', loadChildren: () => import('./pages/collective-goal/collective-goal.module').then(m => m.CollectiveGoalPageModule), },
  { path: 'notifications', loadChildren: () => import('./pages/feed/notifications/notifications.module').then(m => m.NotificationsModule) },
  { path: 'supports', loadChildren: () => import('./pages/supports/supports.module').then(m => m.SupportsPageModule) },
  { path: 'profile', redirectTo: 'profile/'},
  { path: 'profile/:id', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule) },
  { path: 'settings', loadChildren: () => import('@strive/user/user/components/settings/settings.module').then(m => m.SettingsPageModule)},
  { path: 'terms', loadChildren: () => import('@strive/ui/static-information/terms/terms.page').then(m => m.TermsPageModule) },
  { path: 'privacy-policy', loadChildren: () => import('@strive/ui/static-information/privacy/privacy-policy.page').then(m => m.PrivacyPolicyPageModule) },
  { path: 'edit-profile', loadChildren: () => import('./pages/profile/edit-profile/edit-profile.module').then(m => m.EditProfileModule) }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
