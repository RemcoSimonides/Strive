import { Component, OnInit } from '@angular/core';
// Ionic
import { ModalController, PopoverController } from '@ionic/angular';
// Pages
import { ExerciseAffirmationExplanationPage } from './popovers/exercise-affirmation-explanation/exercise-affirmation-explanation.page'
// Services
import { AuthService } from 'apps/journal/src/app/services/auth/auth.service';
// Interfaces
import { IAffirmations } from 'apps/journal/src/app/interfaces/exercises.interface';
import { ExercisesService } from 'apps/journal/src/app/services/exercises/exercises.service';

@Component({
  selector: 'app-exercise-affirmation',
  templateUrl: './exercise-affirmation.page.html',
  styleUrls: ['./exercise-affirmation.page.scss'],
})
export class ExerciseAffirmationPage implements OnInit {

  public _affirmations: IAffirmations = <IAffirmations>{ times: ['', '', ''], affirmations: [] }
  private _profileId: string

  enumAffirmationCategory = enumAffirmationCategory
  public _suggestions: IAffirmationSuggestion[] = [
    { affirmation: 'I eat well, exercise regularly and get plenty of rest to enjoy good health', category: enumAffirmationCategory.health },
    { affirmation: 'I am what I eat', category: enumAffirmationCategory.health },
    { affirmation: 'I eat healthy nutritious food that benefits my body', category: enumAffirmationCategory.health },
    { affirmation: 'I take care of my body', category: enumAffirmationCategory.health },
    { affirmation: 'I trust the signals my body sends me', category: enumAffirmationCategory.health },
    { affirmation: 'I love every cell in my body', category: enumAffirmationCategory.health },
    { affirmation: 'I am surrounded by people who encourage me to be healthy', category: enumAffirmationCategory.health },
    { affirmation: 'I manifest perfect health by making smart choices', category: enumAffirmationCategory.health },
    { affirmation: 'I look forward to a healthy old age because I take loving care of my body now', category: enumAffirmationCategory.health },
    { affirmation: 'I am pain free and completely in sync with life', category: enumAffirmationCategory.health },
    { affirmation: 'I am grateful for my healthy body', category: enumAffirmationCategory.health },
    { affirmation: 'I am grateful to be alive', category: enumAffirmationCategory.health },
    { affirmation: 'I learn from my mistakes', category: enumAffirmationCategory.personal_development },
    { affirmation: 'I know I can accomplish anything I set my mind to', category: enumAffirmationCategory.personal_development },
    { affirmation: 'I turn obstacles into learning opportunities', category: enumAffirmationCategory.personal_development },
    { affirmation: 'I stand up for my beliefs, values and morals', category: enumAffirmationCategory.personal_development },
    { affirmation: 'I treat others with respect and appreciate their individuality', category: enumAffirmationCategory.personal_development },
    { affirmation: 'I contribute my talents and knowledge for the good of all', category: enumAffirmationCategory.personal_development },
    { affirmation: 'I make a difference whenever I can', category: enumAffirmationCategory.personal_development },
    { affirmation: 'I value my time and input', category: enumAffirmationCategory.personal_development },
    { affirmation: 'I endeavor to be the best that I can be', category: enumAffirmationCategory.personal_development },
    { affirmation: 'I never give up', category: enumAffirmationCategory.motivation },
    { affirmation: 'I support and encourage others', category: enumAffirmationCategory.motivation },
    { affirmation: 'I can accomplish anything', category: enumAffirmationCategory.motivation },
    { affirmation: 'I will continue till I achieve my goals', category: enumAffirmationCategory.motivation },
    { affirmation: 'I enjoy challanges. I take them head on and win over them', category: enumAffirmationCategory.motivation },
    { affirmation: 'Motivation comes to me from inside', category: enumAffirmationCategory.motivation },
    { affirmation: 'The only option for me is success', category: enumAffirmationCategory.motivation },
    { affirmation: 'I am a winner', category: enumAffirmationCategory.motivation },
    { affirmation: 'Life is good!', category: enumAffirmationCategory.positive_mindset },
    { affirmation: 'Live and let live', category: enumAffirmationCategory.positive_mindset },
    { affirmation: 'Live is what I make it', category: enumAffirmationCategory.positive_mindset },
    { affirmation: 'I live each day to the fullest', category: enumAffirmationCategory.positive_mindset },
    { affirmation: 'I know, accept, and am true to myself', category: enumAffirmationCategory.positive_mindset },
    { affirmation: 'I believe in, trust, and have confidence in myself', category: enumAffirmationCategory.positive_mindset },
    { affirmation: 'I am a unique and worthy person', category: enumAffirmationCategory.positive_mindset },
    { affirmation: 'I respect myself', category: enumAffirmationCategory.positive_mindset },
    { affirmation: 'I accept what I cannot change', category: enumAffirmationCategory.positive_mindset },
    { affirmation: 'I look for humor and fun in as many situations as possible', category: enumAffirmationCategory.positive_mindset },
    { affirmation: 'I enjoy life to the fullest', category: enumAffirmationCategory.positive_mindset },
    { affirmation: 'I focus on the positive', category: enumAffirmationCategory.positive_mindset },
    { affirmation: 'I have control over my thoughts, feelings and choices', category: enumAffirmationCategory.positive_mindset },
    { affirmation: 'I have a lot to offer', category: enumAffirmationCategory.positive_mindset },
    { affirmation: 'I appreciate all the good things in life', category: enumAffirmationCategory.positive_mindset },
    { affirmation: 'Money comes to me easily and effortlessly', category: enumAffirmationCategory.money },
    { affirmation: 'Wealth constantly flows into my life', category: enumAffirmationCategory.money },
    { affirmation: 'My actions create constant prosperity', category: enumAffirmationCategory.money },
    { affirmation: 'I am aligned with the energy of abundance', category: enumAffirmationCategory.money },
    { affirmation: 'I am a magnet for money', category: enumAffirmationCategory.money },
    { affirmation: 'I am worthy of making more money', category: enumAffirmationCategory.money },
    { affirmation: 'Money creates positive impact in my life', category: enumAffirmationCategory.money },
    { affirmation: 'Money comes to me in expected and unexpected ways', category: enumAffirmationCategory.money },
    { affirmation: 'I take pleasure in my own solitude', category: enumAffirmationCategory.love },
    { affirmation: 'I love and approve myself', category: enumAffirmationCategory.love },
    { affirmation: 'I am loved', category: enumAffirmationCategory.love },
    { affirmation: 'I am surrounded by love', category: enumAffirmationCategory.love },
    { affirmation: 'My heart is always open and I radiate love', category: enumAffirmationCategory.love },
    { affirmation: 'All my relationships are long-lasting and loving', category: enumAffirmationCategory.love },
    { affirmation: 'I see everything with loving eyes and I love everything I see', category: enumAffirmationCategory.love },
    { affirmation: 'I have attracted the most loving person in my life and my life is now full of joy', category: enumAffirmationCategory.love },
    { affirmation: 'My partner is the love of my life and the center of the universe', category: enumAffirmationCategory.love },
    { affirmation: 'My partner loves me as much as I love him', category: enumAffirmationCategory.love },
    { affirmation: 'I understand my partner perfectly as I am able to see his/her point of view', category: enumAffirmationCategory.love },
    { affirmation: 'I always express my feelings openly to my partner', category: enumAffirmationCategory.love },
    { affirmation: 'I give out love and it is returned to me multiplied many fold', category: enumAffirmationCategory.love },
  ]
  private _suggestionsCopy: IAffirmationSuggestion[]

  constructor(
    private authService: AuthService,
    private exercisesService: ExercisesService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController
    ) { }

  async ngOnInit() {
    const { uid } = await this.authService.afAuth.currentUser;
    this._profileId = uid

    // load affirmations
    this._affirmations = await this.exercisesService.getAffirmations(this._profileId)
    if (!this._affirmations.affirmations) {
      this._affirmations = <IAffirmations>{ affirmations: [], times: ['', '', ''] }    
    }

    this.addEmptyAffirmation()

    // shuffle suggestions
    this._suggestions = this.shuffle(this._suggestions)
    this._suggestionsCopy = Object.assign([], this._suggestions)
  }

  async dismiss() {
    await this.modalCtrl.dismiss()
  }

  async removeSetTime(index: number): Promise<void> {

    if (index === 0 && this._affirmations.times[1] !== '') {
      // move position
      this._affirmations.times[0] = this._affirmations.times[1]
      if (this._affirmations.times[2] !== '') {
        this._affirmations.times[1] = this._affirmations.times[2]
        this._affirmations.times[2] = ''
      } else {
        this._affirmations.times[1] = ''
      }
      
    } else {
      this._affirmations.times[0] = ''
    }

    if (index === 1 && this._affirmations.times[2] !== '') {
      this._affirmations.times[1] = this._affirmations.times[2]
      this._affirmations.times[2] = ''
    }

    if (index === 2) {
      this._affirmations.times[2] = ''
    }

  }

  async openExplanationPopover(): Promise<void> {

    // css for in global.css
    const popover = await this.popoverCtrl.create({
      component: ExerciseAffirmationExplanationPage,
      cssClass: "explanation_popover_class"
    })
    await popover.present()
    
  }

  onInput($event, affirmation: string) {

    if (affirmation === '' && $event.detail.data !== null) {
      this.addEmptyAffirmation()
    }

  }

  removeControl(index: number) {
    this._affirmations.affirmations.splice(index, 1)
    if (this._affirmations.affirmations.length === 0 || this._affirmations.affirmations[this._affirmations.affirmations.length - 1] !== '') {
      this.addEmptyAffirmation()
    }
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  filterSuggestions(filter: enumAffirmationCategory) {    
    // reset suggestions
    this._suggestions = Object.assign([], this._suggestionsCopy)
    if (filter === enumAffirmationCategory.all) return
    this._suggestions = this._suggestions.filter(suggestion => suggestion.category === filter )
  }

  addSuggestion(suggestion: IAffirmationSuggestion) {
    // add suggestion
    this._affirmations.affirmations.splice(this._affirmations.affirmations.length - 1, 0,suggestion.affirmation)

    // remove suggestion from suggestions
    const indexX = this._suggestions.findIndex(x => x.affirmation === suggestion.affirmation)
    if (indexX > -1) this._suggestions.splice(indexX, 1)
    const indexY = this._suggestionsCopy.findIndex(y => y.affirmation === suggestion.affirmation)
    if (indexY > -1) this._suggestionsCopy.splice(indexY, 1)
  }

  private addEmptyAffirmation(): void {
    this._affirmations.affirmations.push('')
  }

  async saveAffirmations(): Promise<void> {
    this._affirmations.affirmations = this._affirmations.affirmations.filter(affirmation => affirmation !== '')

    await this.exercisesService.saveAffirmations(this._profileId, this._affirmations)

    await this.modalCtrl.dismiss()

  }

  private shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }
  

}

interface IAffirmationSuggestion {
  affirmation: string,
  category: enumAffirmationCategory
}

enum enumAffirmationCategory {
  all,
  health,
  personal_development,
  motivation,
  positive_mindset,
  money,
  love,
}