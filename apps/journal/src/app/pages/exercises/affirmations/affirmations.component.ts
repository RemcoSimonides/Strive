import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core'
import { AbstractControl, FormArray, FormControl, FormGroup, UntypedFormArray } from '@angular/forms'
import { ModalController, PopoverController } from '@ionic/angular'

import { debounceTime, of, Subscription, switchMap, tap } from 'rxjs'

import { AffirmationSuggestion, enumAffirmationCategory, affirmationSuggestions } from '@strive/model'

import { AffirmationService } from '@strive/exercises/affirmation/affirmation.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SeoService } from '@strive/utils/services/seo.service'

import { AffirmationExplanationComponent } from '@strive/exercises/affirmation/components/explanation/explanation.component';
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { AuthService } from '@strive/user/auth/auth.service'

function timeFormControls() {
  return [new FormControl(''), new FormControl(''), new FormControl('')]
}

@Component({
  selector: 'journal-affirmations',
  templateUrl: './affirmations.component.html',
  styleUrls: ['./affirmations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AffirmationsComponent implements OnDestroy {
  isLoading = true

  enumAffirmationCategory = enumAffirmationCategory
  suggestions = affirmationSuggestions
  private suggestionsCopy: AffirmationSuggestion[]

  form = new FormGroup({
    affirmations: new FormArray([]),
    times: new UntypedFormArray(timeFormControls())
  })

  get affirmationsForm() { return this.form.get('affirmations') as FormArray }
  get affirmations(): string[] { return this.affirmationsForm.value }
  get timesForm() { return this.form.get('times') as FormArray }
  get times(): string[] { return this.timesForm.value }

  private subs: Subscription[] = []
  uid$ = this.auth.uid$

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    public screensize: ScreensizeService,
    private seo: SeoService,
    private service: AffirmationService
  ) {
    this.seo.generateTags({
      title: 'Affirmations - Strive Journal',
      description: 'Exercise to help you prioritize positive thoughts over negative thoughts'
    })
    this.shuffle(this.suggestions)
    this.suggestionsCopy = Object.assign([], this.suggestions)

    const sub = this.auth.profile$.pipe(
      switchMap(profile => profile ? this.service.getAffirmations(profile.uid) : of(undefined)),
      tap(doc => {
        this.affirmationsForm.clear({ emitEvent: false })

        if (doc) {
          this.timesForm.setValue(doc.times, { emitEvent: false })
  
          for (const affirmation of doc.affirmations) {
            this.affirmationsForm.push(new FormControl(affirmation), { emitEvent: false })
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
    ).subscribe(value => {
      if (!this.auth.uid) return
      if (!value?.affirmations) return
      if (!value?.times) return
      const { times } = value
      const affirmations = value.affirmations.filter(a => a !== '')
      this.service.saveAffirmations(this.auth.uid, { affirmations, times })
      this.form.markAsPristine()
      this.cdr.markForCheck()
    })

    this.subs.push(sub, formSub, affirmationFormSub)
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

  openExplanation() {
    this.popoverCtrl.create({
      component: AffirmationExplanationComponent,
      cssClass: "explanation_popover_class"
    }).then(popover => popover.present())
  }

  async openDatetime(index: number) {
    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { presentation: 'time' }
    })
    popover.onDidDismiss().then(({ data, role }) => {
      const control = this.timesForm.get(`${index}`) as AbstractControl
      if (role === 'dismiss') {
        const value = data ? data : new Date().toISOString()
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