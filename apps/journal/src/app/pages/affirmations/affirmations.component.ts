import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { FormArray, FormControl } from "@angular/forms";
import { PopoverController } from "@ionic/angular";
import { AffirmationSuggestion, enumAffirmationCategory, suggestions } from "@strive/exercises/affirmation/+state/affirmation.model";
import { AffirmationService } from "@strive/exercises/affirmation/+state/affirmation.service";
import { AffirmationExplanationComponent } from "@strive/exercises/affirmation/components/explanation/explanation.component";
import { DatetimeComponent } from "@strive/ui/datetime/datetime.component";
import { UserService } from "@strive/user/user/+state/user.service";
import { ScreensizeService } from "@strive/utils/services/screensize.service";
import { of, switchMap, tap } from "rxjs";

@Component({
  selector: 'journal-affirmations',
  templateUrl: './affirmations.component.html',
  styleUrls: ['./affirmations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AffirmationsComponent implements OnDestroy {

  shortDescription = true
  isLoading = true

  enumAffirmationCategory = enumAffirmationCategory
  suggestions = suggestions
  private suggestionsCopy: AffirmationSuggestion[]

  times = ['', '', ''];
  form = new FormArray([])

  get affirmations(): string[] {
    return this.form.value
  }

  private sub = this.user.user$.pipe(
    switchMap(user => user ? this.service.getAffirmations(user.uid) : of()),
    tap(doc => {
      if (doc) {
        this.times = doc.times;
        const affirmations = doc.affirmations.map(affirmation => new FormControl(affirmation))
        this.form = new FormArray(affirmations)
      } else {
        this.times = ['', '', '']
        this.form = new FormArray([])
      }
      
      this.isLoading = false
      this.form.push(new FormControl(''))
      this.cdr.markForCheck()
    })
  ).subscribe()

  constructor(
    public screensize: ScreensizeService,
    private service: AffirmationService,
    public user: UserService,
    private popoverCtrl: PopoverController,
    private cdr: ChangeDetectorRef
  ) {
    this.shuffle(this.suggestions)
    this.suggestionsCopy = Object.assign([], this.suggestions)
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  save() {
    if (!this.user.uid) return

    const affirmations = this.affirmations.filter(affirmation => affirmation !== '')
    this.service.saveAffirmations(this.user.uid, {
      affirmations,
      times: this.times
    })
  }

  openExplanation() {
    this.popoverCtrl.create({
      component: AffirmationExplanationComponent,
      cssClass: "explanation_popover_class"
    }).then(popover => popover.present())
  }

  toggleReadMore() {
    this.shortDescription = !this.shortDescription
  }

  async openDatetime(index: number) {
    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { presentation: 'time' }
    })
    popover.onDidDismiss().then(({ data, role }) => {
      if (role === 'dismiss') {
        this.times[index] = data ? data : new Date().toISOString()
        this.cdr.markForCheck()
      }
    })
    popover.present()
  }

  removeSetTime(index: number) {
    this.times[index] = ''
    this.times.sort((a, b) => b === '' ? -1 : 1)
  }

  onInput($event, affirmation: string) {
    if (affirmation === '' && $event.detail.data !== null) {
      this.form.push(new FormControl(''))
    }
  }

  removeAffirmation(index: number) {
    this.form.removeAt(index)
    if (this.form.length === 0 || this.affirmations[this.affirmations.length - 1] !== '') {
      this.form.push(new FormControl(''))
    }
  }

  filterSuggestions(filter: enumAffirmationCategory) {    
    this.suggestions = Object.assign([], this.suggestionsCopy)
    if (filter === enumAffirmationCategory.all) return
    this.suggestions = this.suggestions.filter(suggestion => suggestion.category === filter)
  }

  addSuggestion(suggestion: AffirmationSuggestion) {
    // add suggestion
    this.form.insert(this.form.length - 1, new FormControl(suggestion.affirmation))

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
}