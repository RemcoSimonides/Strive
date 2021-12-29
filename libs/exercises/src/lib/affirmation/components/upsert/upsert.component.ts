import { Component, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ModalController, PopoverController } from '@ionic/angular';
import { UserService } from '@strive/user/user/+state/user.service';
import { Affirmations } from '../../+state/affirmation.firestore';
import { AffirmationService } from '../../+state/affirmation.service';
import { AffirmationSuggestion, enumAffirmationCategory, suggestions } from '../../+state/affirmation.model';
import { AffirmationExplanationComponent } from '../explanation/explanation.component';
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component';

@Component({
  selector: 'exercise-affirmation-upsert',
  templateUrl: 'upsert.component.html',
  styleUrls: ['./upsert.component.scss']
})
export class AffirmationUpsertComponent implements OnInit {
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }

  private suggestionsCopy: AffirmationSuggestion[]
  enumAffirmationCategory = enumAffirmationCategory

  affirmations = <Affirmations>{ times: ['', '', ''], affirmations: [] }
  suggestions = suggestions

  constructor(
    private user: UserService,
    private service: AffirmationService,
    private location: Location,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController
  ) {
    window.history.pushState(null, null, window.location.href)
    modalCtrl.getTop().then(modal => {
      modal.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

  async ngOnInit() {
    const affirmations = await this.service.getAffirmations(this.user.uid)
    if (affirmations) this.affirmations = affirmations

    this.addEmptyAffirmation()
    
    this.shuffle(this.suggestions)
    this.suggestionsCopy = Object.assign([], this.suggestions)
  }

  dismiss() {
    this.location.back()
  }

  async openDatetime(index: number) {
   const popover = await this.popoverCtrl.create({
     component: DatetimeComponent,
     componentProps: {
       presentation: 'time'
     }
   })
   popover.onDidDismiss().then(({ data, role }) => {
     console.log('data role: ', data, role, index)
    if (role === 'dismiss') {
      this.affirmations.times[index] = data
    }
   })
   popover.present()
  }

  async removeSetTime(index: number) {

    if (index === 0 && this.affirmations.times[1] !== '') {
      // move position
      this.affirmations.times[0] = this.affirmations.times[1]
      if (this.affirmations.times[2] !== '') {
        this.affirmations.times[1] = this.affirmations.times[2]
        this.affirmations.times[2] = ''
      } else {
        this.affirmations.times[1] = ''
      }
      
    } else {
      this.affirmations.times[0] = ''
    }

    if (index === 1 && this.affirmations.times[2] !== '') {
      this.affirmations.times[1] = this.affirmations.times[2]
      this.affirmations.times[2] = ''
    }

    if (index === 2) {
      this.affirmations.times[2] = ''
    }

  }

  openExplanation() {
    this.popoverCtrl.create({
      component: AffirmationExplanationComponent,
      cssClass: "explanation_popover_class"
    }).then(popover => popover.present())
  }

  onInput($event, affirmation: string) {

    if (affirmation === '' && $event.detail.data !== null) {
      this.addEmptyAffirmation()
    }

  }

  removeControl(index: number) {
    this.affirmations.affirmations.splice(index, 1)
    if (this.affirmations.affirmations.length === 0 || this.affirmations.affirmations[this.affirmations.affirmations.length - 1] !== '') {
      this.addEmptyAffirmation()
    }
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  filterSuggestions(filter: enumAffirmationCategory) {    
    // reset suggestions
    this.suggestions = Object.assign([], this.suggestionsCopy)
    if (filter === enumAffirmationCategory.all) return
    this.suggestions = this.suggestions.filter(suggestion => suggestion.category === filter )
  }

  addSuggestion(suggestion: AffirmationSuggestion) {
    // add suggestion
    this.affirmations.affirmations.splice(this.affirmations.affirmations.length - 1, 0, suggestion.affirmation)

    // remove suggestion from suggestions
    const indexX = this.suggestions.findIndex(x => x.affirmation === suggestion.affirmation)
    if (indexX > -1) this.suggestions.splice(indexX, 1)
    const indexY = this.suggestionsCopy.findIndex(y => y.affirmation === suggestion.affirmation)
    if (indexY > -1) this.suggestionsCopy.splice(indexY, 1)
  }

  private addEmptyAffirmation() {
    this.affirmations.affirmations.push('')
  }

  save() {
    this.affirmations.affirmations = this.affirmations.affirmations.filter(affirmation => affirmation !== '')
    this.service.saveAffirmations(this.user.uid, this.affirmations)
    this.dismiss()
  }

  private shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}