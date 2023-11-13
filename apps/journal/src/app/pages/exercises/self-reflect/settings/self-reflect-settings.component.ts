import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule, ModalController, PopoverController } from '@ionic/angular'

import { firstValueFrom, map, of, shareReplay, switchMap } from 'rxjs'

import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { HeaderModule } from '@strive/ui/header/header.module'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

import { AuthService } from '@strive/auth/auth.service'
import { SelfReflectSettingsService } from '@strive/exercises/self-reflect/self-reflect.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SelfReflectCategory, SelfReflectQuestion, Setting, selfReflectQuestions, selfReflectSettings, createSelfReflectQuestion, createSelfReflectSettings } from '@strive/model'
import { SelfReflectMetaSettingsForm, SelfReflectSettingsForm } from '@strive/exercises/self-reflect/forms/self-reflect-settings.form'
import { SelfReflectCustomQuestionModalComponent } from '@strive/exercises/self-reflect/modals/upsert-custom-question/upsert-custom-question.component'

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
    PageLoadingModule
  ]
})
export class SelfReflectSettingsComponent implements OnInit {

  isMobile$ = this.screensize.isMobile$
  loading = signal<boolean>(true)

  metaSettingsForm = new SelfReflectMetaSettingsForm(selfReflectQuestions)
  form = new SelfReflectSettingsForm()

  settings$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.service.valueChanges('SelfReflect', { uid: profile.uid }) : of(undefined)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  customQuestions$ = this.settings$.pipe(
    map(settings => settings ? settings.questions.filter(({ setting }) => setting === 'custom') : [])
  )

  settings: Record<Exclude<Setting, 'custom'> , { title: string, description: string }> = {
    dearFutureSelf: {
      title: 'Dear Future Self',
      description: 'Write a message/advice/predictions to your future self',
    },
    environment: {
      title: 'Environment',
      description: 'How did you contribute to the environment?',
    },
    explore: {
      title: 'Explore',
      description: 'What do you want to explore?',
    },
    forgive: {
      title: 'Forgive / Letting go',
      description: 'What do you want to forgive or let go of?'
    },
    gratitude: {
      title: 'Gratitude',
      description: 'What are you grateful for?'
    },
    imagine: {
      title: 'Imagine',
      description: 'Imagine your life in 5 years'
    },
    learn: {
      title: 'Learn',
      description: 'What do you want to learn?'
    },
    pride: {
      title: 'Pride',
      description: 'What are you proud of?'
    },
    prioritizeGoals: {
      title: 'Prioritize Goals',
      description: 'Order your goals by priority'
    },
    timeManagement: {
      title: 'Time Management',
      description: 'What did you spend your time on?'
    },
    wheelOfLife: {
      title: 'Wheel of Life',
      description: 'Rate how you feel'
    }
  }

  steps: Record<SelfReflectCategory, string> = {
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
    other: 'Other'
  }

  get settingKeys() { return Object.keys(this.metaSettingsForm.controls) }

  constructor(
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

    this.metaSettingsForm.valueChanges.subscribe(values => {
      for (const [setting, value] of Object.entries(values)) {
        const questions = selfReflectQuestions.filter(question => question.setting === setting)
        for (const question of questions) {
          const controls = this.form.questions.controls.filter(ctrl => ctrl.setting.value === question.setting)

          for (const control of controls) {
            if (control.interval.value === value) continue
            control.interval.setValue(value, { emitEvent: false})
          }
        }
      }
      this.form.updateValueAndValidity()
    })
  }

  async ngOnInit() {
    const settings = await firstValueFrom(this.settings$)

    if (settings && settings.questions.length) {
      this.form.patchValue(settings, { emitEvent: false })
      this.metaSettingsForm.patchAllValue(settings.questions.filter(({ setting }) => setting !== 'custom' ))
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