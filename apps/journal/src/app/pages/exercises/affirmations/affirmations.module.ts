import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AffirmationsComponent } from './affirmations.component';

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { ActivatePushNotificaitonsModule } from '@strive/exercises/components/activate-push-notifications/activate-push-notifications.module';
import { HeaderModule } from '@strive/ui/header/header.module';

const routes: Routes = [
  {
    path: '',
    component: AffirmationsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    PageLoadingModule,
    ActivatePushNotificaitonsModule,
    HeaderModule
  ],
  declarations: [AffirmationsComponent]
})
export class AffirmationsModule {}