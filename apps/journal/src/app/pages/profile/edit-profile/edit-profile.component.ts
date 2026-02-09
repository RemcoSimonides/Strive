import { Location } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, inject } from '@angular/core'
import { Router, RouterModule } from '@angular/router'

import { AlertController, IonContent, IonCard, IonCardContent, IonItem, IonInput, IonButton, ModalController } from '@ionic/angular/standalone'

import { take } from 'rxjs/operators'

import { createUser } from '@strive/model'
import { UserForm } from '@strive/user/forms/user.form'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { AuthService } from '@strive/auth/auth.service'
import { ProfileService } from '@strive/user/profile.service'

import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'
import { HeaderComponent } from '@strive/ui/header/header.component'

@Component({
    selector: 'journal-edit-profile',
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    RouterModule,
    ReactiveFormsModule,
    HeaderComponent,
    ImageSelectorComponent,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton
]
})
export class EditProfilePageComponent {
  private alertCtrl = inject(AlertController);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private location = inject(Location);
  private modalCtrl = inject(ModalController);
  private profileService = inject(ProfileService);
  private router = inject(Router);
  screensize = inject(ScreensizeService);

  @ViewChild(ImageSelectorComponent) imageSelector?: ImageSelectorComponent

  form = new UserForm(this.auth.profile())

  isLoggedIn = this.auth.isLoggedIn
  uid = this.auth.uid

  constructor() {
    this.auth.profile$.pipe(take(1)).subscribe(profile => {
      this.form.patchValue(createUser(profile))
      this.cdr.markForCheck()
    })
  }

  update() {
    if (this.imageSelector?.step.value === 'crop') {
      this.imageSelector.cropIt()
    }

    const username = this.form.username.value ?? ''

    this.form.username.setValue(username.trim())

    if (this.form.valid) {
      this.profileService.update({
        uid: this.auth.uid() ?? '',
        photoURL: this.form.photoURL.value ?? '',
        username
      })
      this.location.back()
    }
  }

  back() {
    this.location.back()
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  deleteAccount() {
    this.alertCtrl.create({
      subHeader: 'Are you sure you want to delete your account?',
      message: `This action is irreversible`,
      buttons: [
        {
          text: 'No, dont delete',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Yes, delete',
          cssClass: 'alert-button-delete',
          handler: async () => {
            const uid = this.auth.uid()
            if (!uid) return
            await this.profileService.remove(uid)
            await this.auth.signout()
            this.router.navigate(['/'])
          }
        },
      ]
    }).then(alert => alert.present())
  }
}
