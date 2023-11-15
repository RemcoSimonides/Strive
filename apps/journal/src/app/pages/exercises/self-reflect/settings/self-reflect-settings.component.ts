import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { AlertController, IonicModule, ModalController, PopoverController } from '@ionic/angular'

import { firstValueFrom, map, of, shareReplay, switchMap } from 'rxjs'

import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { HeaderModule } from '@strive/ui/header/header.module'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

import { AuthService } from '@strive/auth/auth.service'
import { SelfReflectSettingsService } from '@strive/exercises/self-reflect/self-reflect.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SelfReflectCategory, SelfReflectQuestion, selfReflectSettings, createSelfReflectQuestion, createSelfReflectSettings, selfReflectKeys } from '@strive/model'
import { SelfReflectQuestionFormControl, SelfReflectSettingsForm } from '@strive/exercises/self-reflect/forms/self-reflect-settings.form'
import { SelfReflectCustomQuestionModalComponent } from '@strive/exercises/self-reflect/modals/upsert-custom-question/upsert-custom-question.component'
import { SelfReflectReplaceIntervalPipe, replaceInterval } from '@strive/exercises/self-reflect/pipes/interval.pipe'

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
    SelfReflectReplaceIntervalPipe
  ]
})
export class SelfReflectSettingsComponent implements OnInit {

  isMobile$ = this.screensize.isMobile$
  loading = signal<boolean>(true)

  form = new SelfReflectSettingsForm()

  settings$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.service.valueChanges('SelfReflect', { uid: profile.uid }) : of(undefined)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  customQuestions$ = this.settings$.pipe(
    map(settings => settings ? settings.questions.filter(({ key }) => !selfReflectKeys.includes(key)) : []),
  )

  categories: Record<SelfReflectCategory, string> = {
    intro: '',
    previousIntention: '',
    career: 'Career',
    creative: 'Creative',
    education: 'Education',
    environment: 'Environment',
    financial: 'Financial',
    healthAndFitness: 'Health and Fitness',
    personalDevelopment: 'Personal Development',
    relationships: 'Relationships',
    spiritual: 'Spiritual',
    travelAndAdventures: 'Travel and Adventures',
    other: 'Other',

    dearFutureSelf: 'Dear Future Self',
    wheelOfLife: 'Wheel of Life',
    gratitude: 'Gratitude',
    prioritizeGoals: 'Prioritize Goals',
    outro: ''
  }

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
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

  async openAlert(questionControl: SelfReflectQuestionFormControl) {
    const alert = await this.alertCtrl.create({
      header: 'Choose frequency',
      message: replaceInterval(questionControl.question.value, questionControl.interval.value),
      inputs: [
        { label: 'Never', value: 'never', type: 'radio', checked: questionControl.interval.value === 'never' },
        { label: 'Weekly', value: 'weekly', type: 'radio', checked: questionControl.interval.value === 'weekly' },
        { label: 'Monthly', value: 'monthly', type: 'radio', checked: questionControl.interval.value === 'monthly' },
        { label: 'Quarterly', value: 'quarterly', type: 'radio', checked: questionControl.interval.value === 'quarterly' },
        { label: 'Yearly', value: 'yearly', type: 'radio', checked: questionControl.interval.value === 'yearly' },
      ],
      buttons: ['Save'],
      mode: 'ios'
    })
    alert.onDidDismiss().then(({ data }) => {
      if (!data) return
      const { values } = data
      if (!values) return
      questionControl.interval.setValue(values)
      this.form.updateValueAndValidity()
      this.cdr.markForCheck()
    })
    alert.present()
  }

  async openQuestion(question?: SelfReflectQuestion) {
    const modal = await this.modalCtrl.create({
      component: SelfReflectCustomQuestionModalComponent,
      componentProps: { question }
    })
    modal.onDidDismiss().then(async ({ data }) => {
      if (!data) return
      const question = createSelfReflectQuestion(data)
      const settings = await firstValueFrom(this.settings$)
      if (!settings) throw new Error(`Couldn't get settings`)
      const uid = this.auth.uid
      if (!uid) throw new Error(`Can't save question without uid`)

      if (data.question === 'delete') {
        settings.questions = settings.questions.filter(({ key }) => key !== question.key)
      } else {
        const index = settings.questions.findIndex(({ key }) => key === question.key)
        if (index > -1) {
          settings.questions[index] = question
        } else {
          settings.questions.push(question)
        }
      }

      this.service.save(uid, settings)
    })
    modal.present()
  }
}