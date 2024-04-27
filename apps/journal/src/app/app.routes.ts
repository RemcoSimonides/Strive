import { Routes } from '@angular/router'

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/goals/goals.page').then(m => m.GoalsPageComponent) },
  { path: 'download', loadComponent: () => import('./pages/download/download.component').then(m => m.DownloadPageComponent) },
  { path: 'edit-profile', loadComponent: () => import('./pages/profile/edit-profile/edit-profile.component').then(m => m.EditProfilePageComponent) },
  { path: 'exercise', loadComponent: () => import('./pages/exercises/exercises.component').then(m => m.ExercisesPageComponent) },
  { path: 'exercise/affirmations', loadComponent: () => import('./pages/exercises/affirmations/affirmations.component').then(m => m.AffirmationsPageComponent)},
  { path: 'exercise/dear-future-self', loadComponent: () => import('./pages/exercises/dear-future-self/dear-future-self.component').then(m => m.DearFutureSelfPageComponent)},
  { path: 'exercise/daily-gratitude', loadComponent: () => import('./pages/exercises/daily-gratitude/daily-gratitude.component').then(m => m.DailyGratitudePageComponent)},
  { path: 'exercise/self-reflect', loadComponent: () => import('./pages/exercises/self-reflect/self-reflect.component').then(m => m.SelfReflectComponent)},
  { path: 'exercise/self-reflect/settings', loadComponent: () => import('./pages/exercises/self-reflect/settings/self-reflect-settings.component').then(m => m.SelfReflectSettingsComponent) },
  { path: 'exercise/wheel-of-life', loadComponent: () => import('./pages/exercises/wheel-of-life/wheel-of-life.component').then(m => m.WheelOfLifePageComponent)},
  { path: 'explore', loadComponent: () => import('./pages/explore/explore.page').then(m => m.ExplorePageComponent) },
  { path: 'goals', loadComponent: () => import('./pages/goals/goals.page').then(m => m.GoalsPageComponent) },
  { path: 'goal/:id', loadComponent: () => import('./pages/goal/goal.page').then(m => m.GoalPageComponent) },
  { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsPageComponent) },
  { path: 'privacy-policy', loadComponent: () => import('@strive/ui/static-information/privacy/privacy-policy.page').then(m => m.PrivacyPolicyPageComponent) },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePageComponent) },
  { path: 'profile/:id', loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePageComponent) },
  { path: 'supports', loadComponent: () => import('./pages/supports/supports.page').then(m => m.SupportsPageComponent) },
  { path: 'supports/:id', loadComponent: () => import('./pages/supports/support/support.page').then(m => m.SupportPageComponent) },
  { path: 'settings', loadComponent: () => import('./pages//settings/settings.component').then(m => m.SettingsPageComponent)},
  { path: 'settings/email-notifications', loadComponent: () => import('./pages/settings/email-notification-settings/email-notification-settings.component').then(m => m.EmailNotificationSettingsComponent) },
  { path: 'settings/push-notifications', loadComponent: () => import('./pages/settings/push-notification-settings/push-notification-settings.component').then(m => m.PushNotificationsSettingsComponent) },
  { path: 'terms', loadComponent: () => import('@strive/ui/static-information/terms/terms.page').then(m => m.TermsPageComponent) },
  { path: '**', pathMatch: 'full', loadComponent: () => import('./pages/404/404.component').then(m => m.NotfoundPageComponent) }
]