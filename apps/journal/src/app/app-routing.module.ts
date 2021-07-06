import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  { path: '', redirectTo: 'explore', pathMatch: 'full' },
  { path: 'explore', loadChildren: () => import('./pages/explore/explore.module').then(m => m.ExplorePageModule) },
  { path: 'goals', loadChildren: () => import('./pages/goals/goals.module').then(m => m.GoalsPageModule) },
  { path: 'goal/:id', loadChildren: () => import('./pages/goal/goal-view/goal-view.module').then(m => m.GoalViewPageModule) },
  { path: 'collective-goal/:id', loadChildren: () => import('./pages/collective-goal/collective-goal.module').then(m => m.CollectiveGoalPageModule), },
  { path: 'feed', loadChildren: () => import('./pages/feed/feed.module').then(m => m.FeedPageModule) },
  { path: 'supports', loadChildren: () => import('./pages/supports/supports.module').then(m => m.SupportsPageModule) },
  { path: 'profile/:id', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule) },
  { path: 'terms', loadChildren: () => import('@strive/ui/static-information/terms/terms.module').then(m => m.TermsModule) },
  { path: 'privacy-policy', loadChildren: () => import('@strive/ui/static-information/privacy/privacy-policy.module').then(m => m.PrivacyPolicyModule) }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
