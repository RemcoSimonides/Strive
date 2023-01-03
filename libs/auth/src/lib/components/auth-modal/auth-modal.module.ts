import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { AuthModalComponent } from './auth-modal.page'

import { TermsModule } from '@strive/ui/static-information/terms/terms.module'
import { PrivacyPolicyModule } from '@strive/ui/static-information/privacy/privacy-policy.module'
import { WelcomeModalModule } from '../welcome/welcome.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermsModule,
    ReactiveFormsModule,
    PrivacyPolicyModule,
    WelcomeModalModule
  ],
  declarations: [AuthModalComponent]
})
export class AuthModalModule {}
