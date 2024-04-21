import { Routes } from '@angular/router'

export const routes: Routes = [
  { path: '', loadChildren: () => import('./pages/goals/goals.module').then(m => m.GoalsPageModule) },
  { path: 'download', loadComponent: () => import('./pages/download/download.component').then(m => m.DownloadPageComponent) },
  { path: 'edit-profile', loadChildren: () => import('./pages/profile/edit-profile/edit-profile.module').then(m => m.EditProfilePageModule) },
  { path: 'exercise', loadChildren: () => import('./pages/exercises/exercises.module').then(m => m.ExercisesModule) },
  { path: 'explore', loadChildren: () => import('./pages/explore/explore.module').then(m => m.ExplorePageModule) },
  { path: 'goals', loadChildren: () => import('./pages/goals/goals.module').then(m => m.GoalsPageModule) },
  { path: 'goal/:id', loadChildren: () => import('./pages/goal/goal.module').then(m => m.GoalPageModule) },
  { path: 'notifications', loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsPageModule) },
  { path: 'privacy-policy', loadComponent: () => import('@strive/ui/static-information/privacy/privacy-policy.page').then(m => m.PrivacyPolicyPageComponent) },
  { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule) },
  { path: 'profile/:id', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule) },
  { path: 'supports', loadChildren: () => import('./pages/supports/supports.module').then(m => m.SupportsPageModule) },
  { path: 'supports/:id', loadChildren: () => import('./pages/supports/support/support.module').then(m => m.SupportPageModule) },
  { path: 'settings', loadChildren: () => import('./pages//settings/settings.module').then(m => m.SettingsPageModule)},
  { path: 'settings/email-notifications', loadChildren: () => import('./pages/settings/email-notification-settings/email-notification-settings.module').then(m => m.EmailNotificationSettingsModule) },
  { path: 'settings/push-notifications', loadChildren: () => import('./pages/settings/push-notification-settings/push-notification-settings.module').then(m => m.PushNotificationsSettingsModule) },
  { path: 'terms', loadComponent: () => import('@strive/ui/static-information/terms/terms.page').then(m => m.TermsPageComponent) },
  { path: '**', pathMatch: 'full', loadComponent: () => import('./pages/404/404.component').then(m => m.NotfoundPageComponent) }
]