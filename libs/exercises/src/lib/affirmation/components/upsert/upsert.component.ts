import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { UserService } from '@strive/user/user/+state/user.service';
import { Affirmations } from '../../+state/affirmation.firestore';
import { AffirmationService } from '../../+state/affirmation.service';
import { AffirmationSuggestion, enumAffirmationCategory, suggestions } from '../../+state/affirmation.model';
import { AffirmationExplanationComponent } from '../explanation/explanation.component';

@Component({
  selector: 'exercise-affirmation-upsert',
  templateUrl: 'upsert.component.html',
  styleUrls: ['./upsert.component.scss']
})
export class AffirmationUpsertComponent implements OnInit {

  private suggestionsCopy: AffirmationSuggestion[]
  enumAffirmationCategory = enumAffirmationCategory

  public affirmations: Affirmations = <Affirmations>{ times: ['', '', ''], affirmations: [] }
  public suggestions = suggestions

  constructor(
    private user: UserService,
    private service: AffirmationService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController
  ) { }

  async ngOnInit() {
    this.affirmations = await this.service.getAffirmations(this.user.uid)
    
    this.addEmptyAffirmation()
    
    this.shuffle(this.suggestions)
    this.suggestionsCopy = Object.assign([], this.suggestions)
  }

  dismiss() {
    this.modalCtrl.dismiss()
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
    this.modalCtrl.dismiss()
  }

  private shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}