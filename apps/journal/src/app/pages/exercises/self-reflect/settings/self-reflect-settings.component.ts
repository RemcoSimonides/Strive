import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule, PopoverController } from '@ionic/angular'

import { firstValueFrom, of, shareReplay, switchMap } from 'rxjs'

import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { HeaderModule } from '@strive/ui/header/header.module'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

import { AuthService } from '@strive/auth/auth.service'
import { SelfReflectSettingsService } from '@strive/exercises/self-reflect/self-reflect.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { selfReflectSettings, createSelfReflectSettings } from '@strive/model'
import { SelfReflectSettingsForm } from '@strive/exercises/self-reflect/forms/self-reflect-settings.form'
import { SelfReflectReplaceFrequencyPipe } from '@strive/exercises/self-reflect/pipes/frequency.pipe'

@Component({
  standalone: true,
  selector: 'journal-self-reflect-settings',
  templateUrl: './self-reflect-settings.component.html',
  styleUrls: ['./self-reflect-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    HeaderModule,
    PageLoadingModule,
    SelfReflectReplaceFrequencyPipe
  ]
})
export class SelfReflectSettingsComponent implements OnInit {

  isMobile$ = this.screensize.isMobile$
  loading = signal<boolean>(true)

  form = new SelfReflectSettingsForm()

  private settings$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.service.valueChanges('SelfReflect', { uid: profile.uid }) : of(undefined)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private popoverCtrl: PopoverController,
    private screensize: ScreensizeService,
    private service: SelfReflectSettingsService
  ) {

    this.form.valueChanges.subscribe(() => {
      if (!this.auth.uid) return

      const raw = this.form.getRawValue()
      const settings = createSelfReflectSettings(raw)
      this.service.save(this.auth.uid, settings)
    })
  }

  async ngOnInit() {
    const settings = await firstValueFrom(this.settings$)

    if (settings && settings.questions.length) {
      this.form.patchValue(settings, { emitEvent: false })
    } else {
      this.form.patchValue(selfReflectSettings, { emitEvent: false })
    }
    this.loading.set(false)
  }

  async openTimePicker() {
    const control = this.form.get('preferredTime')
    if (!control) return

    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { presentation: 'time', hideRemove: true, value: control.value },
      cssClass: 'datetime-popover'
    })
    popover.onDidDismiss().then(({ data }) => {
      if (data && this.form) {
        control.setValue(data)
        control.markAsDirty()
      }
      this.cdr.markForCheck()
    })
    popover.present()
  }
}