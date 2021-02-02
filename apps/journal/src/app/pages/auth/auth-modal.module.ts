import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

import { AuthModalPage } from './auth-modal.page';

import { TermsModule } from '@strive/ui/static-information/terms/terms.module';
import { PrivacyPolicyModule } from '@strive/ui/static-information/privacy/privacy-policy.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    IonicModule,
    TermsModule,
    ReactiveFormsModule,
    PrivacyPolicyModule
  ],
  declarations: [AuthModalPage]
})
export class AuthModalModule {}
