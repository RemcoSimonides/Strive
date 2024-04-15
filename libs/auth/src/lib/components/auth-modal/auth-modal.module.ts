import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AuthModalComponent } from './auth-modal.page'

import { IonButton, IonIcon, IonHeader, IonToolbar, IonButtons, IonContent, IonList, IonItem, IonInput } from '@ionic/angular/standalone'

import { TermsModule } from '@strive/ui/static-information/terms/terms.module'
import { PrivacyPolicyModule } from '@strive/ui/static-information/privacy/privacy-policy.module'
import { WelcomeModalModule } from '../welcome/welcome.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TermsModule,
    ReactiveFormsModule,
    PrivacyPolicyModule,
    WelcomeModalModule,
    IonButton,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonContent,
    IonList,
    IonItem,
    IonInput
  ],
  declarations: [AuthModalComponent]
})
export class AuthModalModule { }
