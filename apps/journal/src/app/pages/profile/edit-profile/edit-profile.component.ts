import { CommonModule, Location } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core'
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
import { ImagesSelectorComponent } from '@strive/media/components/images-selector/images-selector.component'
import { HeaderComponent } from '@strive/ui/header/header.component'

@Component({
  standalone: true,
  selector: 'journal-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ImagesSelectorComponent,
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
  @ViewChild(ImageSelectorComponent) imageSelector?: ImageSelectorComponent

  form = new UserForm(this.auth.profile)

  isLoggedIn$ = this.auth.isLoggedIn$
  uid = this.auth.uid

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private modalCtrl: ModalController,
    private profileService: ProfileService,
    private router: Router,
    public screensize: ScreensizeService
  ) {
    this.auth.profile$.pipe(take(1)).subscribe(profile => {
      this.form.patchValue(createUser(profile))
      this.cdr.markForCheck()
    })
  }

  update() {
    if (this.imageSelector?.step.value === 'crop') {
      this.imageSelector.cropIt()
    }

    this.form.username.setValue(this.form.username.value.trim())

    if (this.form.valid) {
      this.profileService.update({
        uid: this.auth.uid,
        photoURL: this.form.photoURL.value,
        username: this.form.username.value
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
            if (!this.auth.uid) return
            await this.profileService.remove(this.auth.uid)
            await this.auth.signout()
            this.router.navigate(['/'])
          }
        },
      ]
    }).then(alert => alert.present())
  }
}
