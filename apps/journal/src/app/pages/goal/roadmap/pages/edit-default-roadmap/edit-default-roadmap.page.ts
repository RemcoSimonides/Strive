import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Ionic
import { LoadingController, IonSearchbar, AlertController, Platform } from '@ionic/angular';
// Rxjs
import { first } from 'rxjs/operators';
// Services
import { RoadmapService } from '../../../../../services/roadmap/roadmap.service'
import { FirestoreService } from 'apps/journal/src/app/services/firestore/firestore.service';
import { GoalService } from '@strive/goal/goal/+state/goal.service'
import { TemplateService } from 'apps/journal/src/app/services/template/template.service';
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
// Interfaces
import { 
  IMilestoneTemplabeObject,
  IMilestone,
  ITemplate
} from '@strive/interfaces';
import { Goal } from '@strive/goal/goal/+state/goal.firestore'

@Component({
  selector: 'app-edit-default-roadmap',
  templateUrl: './edit-default-roadmap.page.html',
  styleUrls: ['./edit-default-roadmap.page.scss'],
})
export class EditDefaultRoadmapPage implements OnInit {

  @ViewChild('addMilestonebar') addMilestonebar: IonSearchbar;

  // For templates
  private _collectiveGoalId: string
  private _templateId: string
  // For goals
  private _goalId: string
  private _goal: Goal
  // For both
  public _milestoneTemplateObject: IMilestoneTemplabeObject[]

  public _newSequenceNumber: string

  private _lastSequenceNumberValue: string
  private _lastChangedMilestoneIndex: number

  constructor(
    private alertCtrl: AlertController,
    private db: FirestoreService,
    private goalService: GoalService,
    private loadingCtrl: LoadingController,
    public _platform: Platform,
    private roadmapService: RoadmapService,
    private route: ActivatedRoute,
    private router: Router,
    private _seo: SeoService,
    private templateService: TemplateService
  ) { }

  async ngOnInit() {

    if (!this.router.url.includes('template')) {
      this._goalId = this.route.snapshot.paramMap.get('id')

      this._goal = await this.goalService.getGoal(this._goalId)
      this._milestoneTemplateObject = this._goal.milestoneTemplateObject

      this._seo.generateTags({
        title: `Edit ${this._goal.title} - Strive Journal`
      })

    } else if (this.router.url.includes('template')) {
      this._collectiveGoalId = this.route.snapshot.paramMap.get('id')
      this._templateId = this.route.snapshot.paramMap.get('templateId')

      const template: ITemplate = await this.templateService.getTemplate(this._collectiveGoalId, this._templateId)
      this._milestoneTemplateObject = template.milestoneTemplateObject

      this._seo.generateTags({
        title: `Edit ${template.title} - Strive Journal`
      })
    }

    this._milestoneTemplateObject.forEach(milestone => {
      milestone.numberOfDotsInSequenceNumber = this.getNumberOfDotsInSequenceNumber(milestone.sequenceNumber)
    })

    await this.setInitialSequenceNumber()

    await this.loadingCtrl.getTop().then((v) => v ? this.loadingCtrl.dismiss() : null)

  }

  async cancel(): Promise<void>{

    if (this._goalId) {
      await this.goalService.toggleLock(this._goalId, false)
      this.router.navigateByUrl(`goal/${this._goalId}`)
    }

    if (this._collectiveGoalId && this._templateId) {
      this.router.navigateByUrl(`collective-goal/${this._collectiveGoalId}/template/${this._templateId}`)
    }
  }

  async save(): Promise<void>{
    const loading = await this.loadingCtrl.create({
      spinner: 'lines',
    })
    await loading.present()

    if (this._goalId) {

      // Save milestone object
      await this.db.upsert(`Goals/${this._goalId}`, {
        milestoneTemplateObject: this._milestoneTemplateObject
      })

      // Start conversion to create milestones
      await this.roadmapService.startConversion(this._goalId, this._milestoneTemplateObject)

      await this.goalService.toggleLock(this._goalId, false)

      await loading.dismiss()

      // Then navigate back to goal page
      this.router.navigateByUrl(`goal/${this._goalId}`)

    } else if (this._collectiveGoalId && this._templateId) {

      // Save milestone object
      await this.db.upsert(`CollectiveGoals/${this._collectiveGoalId}/Templates/${this._templateId}`, {
        milestoneTemplateObject: this._milestoneTemplateObject
      })

      await loading.dismiss()

      this.router.navigateByUrl(`collective-goal/${this._collectiveGoalId}/template/${this._templateId}`)

    }

  }

   /**
   * SEQUENCE NUMBER LOGIC
   */

  async onSequenceNumberFocus(sequenceNumber: string){
    this._lastSequenceNumberValue = sequenceNumber
    this._lastChangedMilestoneIndex = this._milestoneTemplateObject.findIndex(milestone => milestone.sequenceNumber === sequenceNumber)
  }

  public async onSequenceNumberBlur(event: CustomEvent, newSequenceNumber: string){

    if (!this.checkSequenceNumberValidity(newSequenceNumber)){
      this._milestoneTemplateObject[this._lastChangedMilestoneIndex].sequenceNumber = this._lastSequenceNumberValue
    } else {

      this._milestoneTemplateObject[this._lastChangedMilestoneIndex].numberOfDotsInSequenceNumber = this.getNumberOfDotsInSequenceNumber(this._milestoneTemplateObject[this._lastChangedMilestoneIndex].sequenceNumber)

      const indexes: {
        from: number,
        to: number
      } = {
        from: this._lastChangedMilestoneIndex,
        to: this.findIndexForNewSequenceNumberPosition(newSequenceNumber)
      }

      // Following three lines reorder the array
      let element = this._milestoneTemplateObject[indexes.from]
      this._milestoneTemplateObject.splice(indexes.from, 1)
      this._milestoneTemplateObject.splice(indexes.to, 0, element)

      this.resetSequenceNumbers()
      this.redetermineNextSequenceNumber()

    }

  }

  public async onSequenceNumberInput(event: CustomEvent, oldValue: string){

    if (event.detail.inputType === "insertText") {
        if (event.detail.data === ".") {
          // Only dot is allowed other than number
        } else if (!isNaN(event.detail.data)) { 
          let valueToBeChecked: string = oldValue === undefined ? event.detail.data : oldValue + event.detail.data

          if (!this.checkSequenceNumberValidity(valueToBeChecked)){
            // Attempt to cancel the change!
            setTimeout(() => {
              this._milestoneTemplateObject[this._lastChangedMilestoneIndex].sequenceNumber = oldValue
            }, 0);
            return
          }
        } else {

          // Attempt to cancel the change!
          setTimeout(() => {
            this._milestoneTemplateObject[this._lastChangedMilestoneIndex].sequenceNumber = oldValue
          }, 0)
          return
        }

    }
  }

  async addMilestone(description: string): Promise<void>{

    //Prevent adding empty descriptions
    if (description === "") return

    //Prevent adding invalid sequence number
    if (!this.checkSequenceNumberValidity(this._newSequenceNumber)){
      return
    }

    const newMilestoneId = await this.db.getNewId()

    const indexForNewMilestone: number = this.findIndexForNewSequenceNumberPosition(this._newSequenceNumber)

    const newMilestone: IMilestoneTemplabeObject = {
      id: newMilestoneId,
      sequenceNumber: this._newSequenceNumber,
      description: description,
      deadline: null,
      numberOfDotsInSequenceNumber: (this._newSequenceNumber.match(/\./g) || []).length
    }

    this._milestoneTemplateObject.splice(indexForNewMilestone, 0, newMilestone)

    this.resetSequenceNumbers()

    this._newSequenceNumber = this.changeSequenceNumberByOne(this._newSequenceNumber, 1)

    this.addMilestonebar.value = ""
  }

  public async deleteMilestone(sequenceNumber: string): Promise<void> {
    const index: number = this._milestoneTemplateObject.findIndex(milestone => milestone.sequenceNumber == sequenceNumber)

    // check if milestone has supports -> then give a warning. Supports will be deleted if deleted
    const milestoneId = this._milestoneTemplateObject[index].id
    const milestone: IMilestone = await this.db.docWithId$<IMilestone>(`Goals/${this._goalId}/Milestones/${milestoneId}`).pipe(first()).toPromise()
    
    if (milestone.numberOfMoneySupports > 0 || milestone.numberOfCustomSupports > 0) {

      const alert = await this.alertCtrl.create({
        header: `Milestone has active supports`,
        subHeader: `Are you sure you want to delete it?`,
        buttons: [
          { 
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            role: 'delete'
          }
        ]
      });
      await alert.present();
      await alert.onDidDismiss().then((res) => {
        if (res.role == 'delete') {
          // delete milestone
          this._milestoneTemplateObject.splice(index, 1)
          this.resetSequenceNumbers()
          this._newSequenceNumber = this.changeSequenceNumberByOne(this._newSequenceNumber, -1)
        }
      })

    } else  {

      // delete milestone
      this._milestoneTemplateObject.splice(index, 1)
      this.resetSequenceNumbers()
      this._newSequenceNumber = this.changeSequenceNumberByOne(this._newSequenceNumber, -1)

    }

   }

  private async setInitialSequenceNumber(): Promise<void> {
    let newSequenceNumber: string

    if (this._milestoneTemplateObject.length > 0) {
      //Set sequence number equal sequence number of last milestone
      newSequenceNumber = this._milestoneTemplateObject[this._milestoneTemplateObject.length - 1].sequenceNumber

      //Add one
      newSequenceNumber = this.changeSequenceNumberByOne(newSequenceNumber, 1)

    } else {
      //No milestones yet -> set to first milestone
      newSequenceNumber = '1'
    }

    this._newSequenceNumber = newSequenceNumber
  }

  private changeSequenceNumberByOne(currentSequenceNumber: string, delta: number): string {
    let lastNumberOfSequenceNumber: string = currentSequenceNumber.slice(currentSequenceNumber.lastIndexOf('.') + 1)
    lastNumberOfSequenceNumber = (+lastNumberOfSequenceNumber + delta).toString()
    currentSequenceNumber = currentSequenceNumber.slice(0, currentSequenceNumber.lastIndexOf('.') + 1) + lastNumberOfSequenceNumber
    
    return currentSequenceNumber
  }

  private findIndexForNewSequenceNumberPosition(sequenceNumber: string): number {
    if (sequenceNumber === "1" && this._milestoneTemplateObject.length === 0){
      return 0
    }

    //Check for equal to existing milestone
    const index = this._milestoneTemplateObject.findIndex(milestone => milestone.sequenceNumber === sequenceNumber)
    if (index > -1){
      return index
    }

    //Need to determine new sequence number
    switch ((sequenceNumber.match(/\./g) || []).length){
      
      case 0:
        return this._milestoneTemplateObject.length
      case 1:
        const firstPartOfSequenceNumberPlusOne: string = (+sequenceNumber.slice(0, sequenceNumber.indexOf('.')) + 1).toString()
        const index = this._milestoneTemplateObject.findIndex(milestone => milestone.sequenceNumber === firstPartOfSequenceNumberPlusOne)
        if (index === -1) {
          return this._milestoneTemplateObject.length
        } else {
          return index
        }
      case 2:
        const firstTwoPartOfSequenceNumberPlusOne: string = (+sequenceNumber.slice(0, sequenceNumber.lastIndexOf('.')) + 1).toString()
        const indexx = this._milestoneTemplateObject.findIndex(milestone => milestone.sequenceNumber === firstTwoPartOfSequenceNumberPlusOne)
        if (indexx !== -1) {
          return indexx
        } else {
          const firstPartOfSequenceNumberPlusOne: string = (+sequenceNumber.slice(0, sequenceNumber.indexOf('.')) + 1).toString()
          const index = this._milestoneTemplateObject.findIndex(milestone => milestone.sequenceNumber === firstPartOfSequenceNumberPlusOne)
          if (index === -1) {
            return this._milestoneTemplateObject.length
          } else {
            return index
          }
        }
    }

    return 0
  }

  private checkSequenceNumberValidity(sequenceNumber): boolean {

    //Check type
    if (typeof sequenceNumber !== "string" ){
      return false
    }

    let leftOne: any
    let leftTwo: any
    let leftThree: any

    switch ((sequenceNumber.match(/\./g) || []).length){
      case 0:
        leftOne = sequenceNumber
        break
      case 1:
        leftOne = sequenceNumber.substr(0, sequenceNumber.indexOf("."))
        leftTwo = sequenceNumber.substr(sequenceNumber.indexOf(".") + 1)
        break
      case 2:
        leftOne = sequenceNumber.substr(0, sequenceNumber.indexOf("."))
        leftTwo = sequenceNumber.substring(sequenceNumber.indexOf(".") + 1, sequenceNumber.lastIndexOf("."))
        leftThree = sequenceNumber.substr(sequenceNumber.lastIndexOf(".") + 1)
       break
    }

    //Check seqno syntax and length
    if (leftOne !== undefined && ( isNaN(+leftOne) || +leftOne === 0) ) return false
    if (leftTwo !== undefined && ( isNaN(+leftTwo) || +leftTwo === 0) ) return false
    if (leftThree !== undefined && ( isNaN(+leftThree) || +leftThree === 0) ) return false

    //Cannot contain more than two dots
    if (this.getNumberOfDotsInSequenceNumber(sequenceNumber) > 2) return false

    //Has to be 1 if there are no milestones yet
    if (this._milestoneTemplateObject.length === 0 && sequenceNumber !== "1"){
      return false
    } else if (this._milestoneTemplateObject.length === 0 && sequenceNumber === "1"){
      return true
    }

    //Can only be equal or one bigger than the previous one
    //Check equal
    let index = this._milestoneTemplateObject.findIndex(milestone => milestone.sequenceNumber === sequenceNumber)
    if (index !== -1) {
      return true
    }

    //Check if one bigger
    let lastNumberOfSequenceNumber: string = sequenceNumber.slice(sequenceNumber.lastIndexOf('.') + 1)
    let potentialPreviousSequenceNumber: string
    if (lastNumberOfSequenceNumber === "1"){
      potentialPreviousSequenceNumber = sequenceNumber.slice(0, sequenceNumber.lastIndexOf('.'))
    } else {
      lastNumberOfSequenceNumber = (+lastNumberOfSequenceNumber - 1).toString()
      potentialPreviousSequenceNumber = sequenceNumber.slice(0, sequenceNumber.lastIndexOf('.') + 1) + lastNumberOfSequenceNumber
    }
    index = this._milestoneTemplateObject.findIndex(milestone => milestone.sequenceNumber === potentialPreviousSequenceNumber)
    if (index === -1) {
      return false
    } else {
      return true
    }

  }

  private resetSequenceNumbers(){

    let counter1 = 1
    let counter2 = 1 
    let counter3 = 1 

    this._milestoneTemplateObject.forEach((milestone, index) => {

      switch ((milestone.sequenceNumber.match(/\./g) || []).length) {
        //Level one milestone
        case 0:

          if (milestone.sequenceNumber != counter1.toString()){
            milestone.sequenceNumber = counter1.toString()
          }
    
          counter1++
          //Reset other counters
          counter2 = 1
          counter3 = 1
          break
        //Level two milestone
        case 1:
          if (milestone.sequenceNumber != counter2.toString()){
            milestone.sequenceNumber = (counter1 - 1).toString() + '.' + counter2.toString()
          }
    
          counter2++
          //Reset other counters
          counter3 = 1
          break
        //Level three milestone
        case 2:

          if (milestone.sequenceNumber != counter3.toString()){

            // Normal seqno level 3 assignment
            if (counter2 - 1 != 0){

              milestone.sequenceNumber = (counter1 - 1).toString() + '.' + (counter2 - 1).toString() + '.' + counter3.toString()
              counter3++
            
            // This is triggered when the milestone above is two levels above the new one. Then the (current) seqno gets converted to a level 2 instead of level 3
            } else {
              milestone.sequenceNumber = (counter1 - 1).toString() + '.' + counter3.toString()
              counter2++
              counter3 = 1
            }
            
          }

          break
      }
    })


  }

  private redetermineNextSequenceNumber(){
    
    if (this.getNumberOfDotsInSequenceNumber(this._newSequenceNumber) === 0 ){
      const lastSeqno: string = this._milestoneTemplateObject[this._milestoneTemplateObject.length - 1].sequenceNumber

      if (this.getNumberOfDotsInSequenceNumber(lastSeqno) === 0){
        this._newSequenceNumber = (+lastSeqno + 1).toString()
      } else {
        this._newSequenceNumber = (+lastSeqno.slice(0, lastSeqno.indexOf(".")) + 1).toString() 
      }
    } else {

      const partBeforeLastNumber: string = this._newSequenceNumber.slice(0, this._newSequenceNumber.lastIndexOf(".") + 1)
      let j = 1
      for(let i = 0 ; i < this._milestoneTemplateObject.length ; i++){
        if (this._milestoneTemplateObject[i].sequenceNumber.slice(0, partBeforeLastNumber.length) === partBeforeLastNumber){
          j++
        }
      }
      this._newSequenceNumber = partBeforeLastNumber + j.toString()
    }
  }

  public getMargin(numberOfDots: number): string {
    return (numberOfDots * 10).toString() + 'px'
  }

  private getNumberOfDotsInSequenceNumber(sequenceNumber: string): number {
    return (sequenceNumber.match(/\./g) || []).length
  }

  private getParentMilestone(sequenceNumber: string): IMilestoneTemplabeObject {

    if (this.getNumberOfDotsInSequenceNumber(sequenceNumber) === 0) return undefined

    const parentSequenceNumber = sequenceNumber.substr(0, sequenceNumber.lastIndexOf('.')) 

    const milestone = this._milestoneTemplateObject.find(milestone => milestone.sequenceNumber === parentSequenceNumber)

    return milestone
  }

  public async _openingDatetime($event, milestone: IMilestoneTemplabeObject): Promise<void> {
    event.stopPropagation(); //prevents roadmap from collapsing in or out :)
    
    // empty value
    $event.target.value = ""

    // set min
    $event.target.min = new Date().toISOString()

    // set max
    if (this.getNumberOfDotsInSequenceNumber(milestone.sequenceNumber) === 0) {
      $event.target.max = this._goal.deadline ? this._goal.deadline : new Date(new Date().getFullYear() + 1000, 12, 31).toISOString()

    } else {

      const parentDeadlineDate: string = this.getParentMilestone(milestone.sequenceNumber).deadline

      if (parentDeadlineDate) {
        $event.target.max = parentDeadlineDate
      } else {
        $event.target.max = this._goal.deadline ? this._goal.deadline : new Date(new Date().getFullYear() + 1000, 12, 31).toISOString()
      }
    }

  }

  public onDeadlineDateChange($event, milestone: IMilestoneTemplabeObject) {
    milestone.deadline = $event.detail.value
  }

}
