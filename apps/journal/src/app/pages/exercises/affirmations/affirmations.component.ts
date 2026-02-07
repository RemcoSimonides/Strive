import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core'
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, UntypedFormArray } from '@angular/forms'

import { IonContent, IonList, IonItem, IonLabel, IonText, IonIcon, IonButton, IonInput, IonSelect, IonSelectOption, ModalController, PopoverController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { closeCircle, checkmarkOutline, addCircle } from 'ionicons/icons'

import { debounceTime, of, Subscription, switchMap, tap } from 'rxjs'
import { AES, enc } from 'crypto-js'

import { AffirmationSuggestion, enumAffirmationCategory, affirmationSuggestions } from '@strive/model'

import { AffirmationService } from '@strive/exercises/affirmation/affirmation.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SeoService } from '@strive/utils/services/seo.service'

import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { AuthService } from '@strive/auth/auth.service'
import { PersonalService } from '@strive/user/personal.service'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { ActivatePushNotificationsComponent } from '@strive/exercises/components/activate-push-notifications/activate-push-notifications.component'
import { HeaderComponent } from '@strive/ui/header/header.component'

function timeFormControls() {
  return [new FormControl(''), new FormControl(''), new FormControl('')]
}

@Component({
    selector: 'journal-affirmations',
    templateUrl: './affirmations.component.html',
    styleUrls: ['./affirmations.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        PageLoadingComponent,
        ActivatePushNotificationsComponent,
        HeaderComponent,
        IonContent,
        IonList,
        IonItem,
        IonLabel,
        IonText,
        IonIcon,
        IonButton,
        IonInput,
        IonSelect,
        IonSelectOption
    ]
})
export class AffirmationsPageComponent implements OnDestroy {
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private modalCtrl = inject(ModalController);
  private personalService = inject(PersonalService);
  private popoverCtrl = inject(PopoverController);
  screensize = inject(ScreensizeService);
  private seo = inject(SeoService);
  private service = inject(AffirmationService);

  isLoading = true

  enumAffirmationCategory = enumAffirmationCategory
  suggestions = affirmationSuggestions
  private suggestionsCopy: AffirmationSuggestion[]

  form = new FormGroup({
    affirmations: new FormArray<FormControl>([]),
    times: new UntypedFormArray(timeFormControls())
  })

  get affirmationsForm() { return this.form.get('affirmations') as FormArray<FormControl> }
  get affirmations(): string[] { return this.affirmationsForm.value }
  get timesForm() { return this.form.get('times') as FormArray<FormControl> }
  get times(): string[] { return this.timesForm.value }

  private subs: Subscription[] = []
  uid = this.auth.uid

  constructor() {
    this.seo.generateTags({
      title: 'Affirmations - Strive Journal',
      description: 'Exercise to help you prioritize positive thoughts over negative thoughts'
    })
    addIcons({ closeCircle, checkmarkOutline, addCircle })

    this.shuffle(this.suggestions)
    this.suggestionsCopy = Object.assign([], this.suggestions)

    const sub = this.auth.profile$.pipe(
      switchMap(profile => profile ? this.service.getAffirmations(profile.uid) : of(undefined)),
      tap(async doc => {
        this.affirmationsForm.clear({ emitEvent: false })

        if (doc) {
          this.timesForm.setValue(doc.times, { emitEvent: false })

          const key = await this.personalService.getEncryptionKey()
          for (const affirmation of doc.affirmations) {
            const decrypted = AES.decrypt(affirmation, key).toString(enc.Utf8)
            this.affirmationsForm.push(new FormControl(decrypted), { emitEvent: false })
          }
        }

        this.affirmationsForm.push(new FormControl(''), { emitEvent: false })
        this.isLoading = false
        this.cdr.markForCheck()
      })
    ).subscribe()

    const affirmationFormSub = this.affirmationsForm.valueChanges.subscribe((affirmations: string[]) => {
      const empty = affirmations.filter(a => a === '')
      if (empty.length > 1) {
        const index = affirmations.lastIndexOf('')
        this.affirmationsForm.removeAt(index)
      }

      if (empty.length === 0) {
        this.affirmationsForm.push(new FormControl(''))
      }
    })

    // autosave
    const formSub = this.form.valueChanges.pipe(
      debounceTime(2000)
    ).subscribe(async value => {
      const uid = this.auth.uid()
      if (!uid) return
      if (!value?.affirmations) return
      if (!value?.times) return
      const { times } = value
      const key = await this.personalService.getEncryptionKey()

      const affirmations = value.affirmations
        .filter(a => a !== '')
        .map((a: string) => AES.encrypt(a, key).toString())

      this.service.saveAffirmations(uid, { affirmations, times })
      this.form.markAsPristine()
      this.cdr.markForCheck()
    })

    this.subs.push(sub, formSub, affirmationFormSub)
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

  async openDatetime(index: number) {
    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { presentation: 'time' },
      cssClass: 'datetime-popover'
    })
    popover.onDidDismiss().then(({ data, role }) => {
      const control = this.timesForm.get(`${index}`) as AbstractControl
      if (role === 'dismiss') {
        const value = data ? data : new Date().toLocaleString()
        control.setValue(value)
      }
      if (role === 'remove') {
        control.setValue('')
      }
      this.timesForm.markAsDirty()
      this.cdr.markForCheck()
    })
    popover.present()
  }

  removeSetTime(index: number) {
    const control = this.timesForm.get(`${index}`) as AbstractControl
    control.setValue('')
    const times = this.times.sort((a, b) => b === '' ? -1 : 1)
    this.timesForm.setValue(times)
    this.timesForm.markAsDirty()
    this.cdr.markForCheck()
  }

  removeAffirmation(index: number) {
    this.affirmationsForm.removeAt(index)
    this.affirmationsForm.markAsDirty()
    this.cdr.markForCheck()
  }

  filterSuggestions(filter: enumAffirmationCategory) {
    this.suggestions = Object.assign([], this.suggestionsCopy)
    if (filter === enumAffirmationCategory.all) return
    this.suggestions = this.suggestions.filter(suggestion => suggestion.category === filter)
  }

  addSuggestion(suggestion: AffirmationSuggestion) {
    // add suggestion
    this.affirmationsForm.insert(this.affirmationsForm.length - 1, new FormControl(suggestion.affirmation))
    this.affirmationsForm.markAsDirty()
    this.cdr.markForCheck()

    // remove suggestion from suggestions
    this.suggestions = this.suggestions.filter(s => s.affirmation !== suggestion.affirmation)
    this.suggestionsCopy = this.suggestionsCopy.filter(s => s.affirmation !== suggestion.affirmation)
  }

  private shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  affirmationsButNoTime(): boolean {
    return this.times.every(time => time === '') && this.affirmationsForm.length > 1
  }
}