import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { DailyGratefulnessComponent } from './daily-gratefulness.component';

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { AuthModalModule } from '@strive/user/auth/components/auth-modal/auth-modal.module';
import { ActivatePushNotificaitonsModule } from '@strive/exercises/components/activate-push-notifications/activate-push-notifications.module';

const routes: Routes = [
  {
    path: '',
    component: DailyGratefulnessComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    PageLoadingModule,
    AuthModalModule,
    ActivatePushNotificaitonsModule
  ],
  declarations: [DailyGratefulnessComponent]
})
export class DailyGratefulnessModule {}