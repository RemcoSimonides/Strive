import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AuthModalComponent } from './auth-modal.page'

import { IonButton, IonIcon, IonHeader, IonToolbar, IonButtons, IonContent, IonList, IonItem, IonInput } from '@ionic/angular/standalone'

import { TermsComponent } from '@strive/ui/static-information/terms/terms.component'
import { PrivacyPolicyComponent } from '@strive/ui/static-information/privacy/privacy-policy.component'
import { WelcomeModalModule } from '../welcome/welcome.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TermsComponent,
    ReactiveFormsModule,
    PrivacyPolicyComponent,
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
