import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule, PopoverController } from '@ionic/angular'

import { debounceTime } from 'rxjs'

import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { HeaderModule } from '@strive/ui/header/header.module'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

import { AuthService } from '@strive/auth/auth.service'
import { AssessLifeSettingsService } from '@strive/exercises/assess-life/assess-life.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { Setting, assessLifeQuestions, assessLifeSettings, createAssessLifeSettings } from '@strive/model'
import { AssessLifeMetaSettingsForm, AssessLifeSettingsForm } from '@strive/exercises/assess-life/forms/assess-life-settings.form'

@Component({
  standalone: true,
  selector: 'journal-assess-life-settings',
  templateUrl: './assess-life-settings.component.html',
  styleUrls: ['./assess-life-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    HeaderModule,
    PageLoadingModule
  ]
})
export class AssessLifeSettingsComponent implements OnInit {

  isMobile$ = this.screensize.isMobile$
  loading = signal<boolean>(true)

  metaSettingsForm = new AssessLifeMetaSettingsForm(assessLifeQuestions)
  form = new AssessLifeSettingsForm(assessLifeSettings)

  settings: Record<Setting, { title: string, description: string }> = {
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

  get settingKeys() { return Object.keys(this.metaSettingsForm.controls) }

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private popoverCtrl: PopoverController,
    private screensize: ScreensizeService,
    private service: AssessLifeSettingsService
  ) {

    this.form.valueChanges.pipe(
      debounceTime(100),
    ).subscribe(() => {
      if (!this.auth.uid) return

      const raw = this.form.getRawValue()
      const settings = createAssessLifeSettings(raw)
      this.service.save(this.auth.uid, settings)
    })

    this.metaSettingsForm.valueChanges.subscribe(values => {
      for (const [setting, value] of Object.entries(values)) {
        const questions = assessLifeQuestions.filter(question => question.setting === setting)
        for (const question of questions) {
          const controls = this.form.questions.controls.filter(ctrl => ctrl.setting.value === question.setting)

          for (const control of controls) {
            if (control.interval.value === value) continue
            control.interval.setValue(value)
          }
        }
      }
    })
  }

  async ngOnInit() {
    const uid = await this.auth.getUID()
    const settings = await this.service.getSettings(uid)
    if (settings) {
      this.form.patchValue(settings)
      this.metaSettingsForm.patchAllValue(settings.questions)
    }
    this.loading.set(false)
  }

  async openTimePicker() {
    const control = this.form.get('preferredTime')
    if (!control) return

    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { presentation: 'time', hideRemove: true, value: control.value }
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