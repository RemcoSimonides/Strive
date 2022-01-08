import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

import { AuthModalModalComponent } from './auth-modal.page';

import { TermsModule } from '@strive/ui/static-information/terms/terms.module';
import { PrivacyPolicyModule } from '@strive/ui/static-information/privacy/privacy-policy.module';
import { WelcomeModalModule } from '../welcome/welcome.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    IonicModule,
    TermsModule,
    ReactiveFormsModule,
    PrivacyPolicyModule,
    WelcomeModalModule
  ],
  declarations: [AuthModalModalComponent]
})
export class AuthModalModule {}
