import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// Ionic
import { LoadingController, IonSearchbar, AlertController, Platform } from '@ionic/angular';
// Rxjs
import { first } from 'rxjs/operators';
// Services
import { RoadmapService } from '../../../../../services/roadmap/roadmap.service'
import { FirestoreService } from '@strive/utils/services/firestore.service';
import { GoalService } from '@strive/goal/goal/+state/goal.service'
import { TemplateService } from 'apps/journal/src/app/services/template/template.service';
import { SeoService } from 'apps/journal/src/app/services/seo/seo.service';
// Interfaces
import { ITemplate } from '@strive/interfaces';
import { Milestone, MilestoneTemplabeObject } from '@strive/milestone/+state/milestone.firestore'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { getNrOfDotsInSeqno, getPartOfSeqno } from '@strive/milestone/+state/milestone.model';
import { MilestoneForm } from '@strive/milestone/forms/milestone.form';

@Component({
  selector: 'app-edit-default-roadmap',
  templateUrl: './edit-default-roadmap.page.html',
  styleUrls: ['./edit-default-roadmap.page.scss'],
})
export class EditDefaultRoadmapPage implements OnInit {

  @ViewChild('addMilestonebar') addMilestonebar: IonSearchbar;

  // For templates
  private collectiveGoalId: string
  private templateId: string
  // For goals
  private goalId: string
  private goal: Goal
  // For both
  public milestoneTemplate: MilestoneTemplabeObject[] = []
  
  public newSequenceNumber: string = '1'

  private prevSeqNo: string
  private prevMilestoneIndex: number

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
      this.goalId = this.route.snapshot.paramMap.get('id')

      this.goal = await this.goalService.getGoal(this.goalId)
      this.milestoneTemplate = this.goal.milestoneTemplateObject

      this._seo.generateTags({
        title: `Edit ${this.goal.title} - Strive Journal`
      })

    } else if (this.router.url.includes('template')) {
      this.collectiveGoalId = this.route.snapshot.paramMap.get('id')
      this.templateId = this.route.snapshot.paramMap.get('templateId')

      const template: ITemplate = await this.templateService.getTemplate(this.collectiveGoalId, this.templateId)
      this.milestoneTemplate = template.milestoneTemplateObject

      this._seo.generateTags({
        title: `Edit ${template.title} - Strive Journal`
      })
    }

    this.setInitialSequenceNumber()
    this.loadingCtrl.getTop().then((v) => v ? this.loadingCtrl.dismiss() : null)
  }

  async cancel(): Promise<void>{
    if (this.goalId) {
      await this.goalService.toggleLock(this.goalId, false)
      this.router.navigateByUrl(`goal/${this.goalId}`)
    }

    if (this.collectiveGoalId && this.templateId) {
      this.router.navigateByUrl(`collective-goal/${this.collectiveGoalId}/template/${this.templateId}`)
    }
  }

  async save(): Promise<void>{
    const loading = await this.loadingCtrl.create({ spinner: 'lines' })
    await loading.present()

    if (this.goalId) {

      // Save milestone object
      await this.db.upsert(`Goals/${this.goalId}`, {
        milestoneTemplateObject: this.milestoneTemplate
      })

      // Start conversion to create milestones
      await this.roadmapService.startConversion(this.goalId, this.milestoneTemplate)

      await this.goalService.toggleLock(this.goalId, false)

      await loading.dismiss()
      this.router.navigateByUrl(`goal/${this.goalId}`)

    } else if (this.collectiveGoalId && this.templateId) {

      // Save milestone object
      await this.db.upsert(`CollectiveGoals/${this.collectiveGoalId}/Templates/${this.templateId}`, {
        milestoneTemplateObject: this.milestoneTemplate
      })

      await loading.dismiss()
      this.router.navigateByUrl(`collective-goal/${this.collectiveGoalId}/template/${this.templateId}`)
    }
  }

   /**
   * SEQUENCE NUMBER LOGIC
   */

  async onSequenceNumberFocus(sequenceNumber: string){
    this.prevSeqNo = sequenceNumber
    this.prevMilestoneIndex = this.milestoneTemplate.findIndex(m => m.sequenceNumber === sequenceNumber)
  }

  public async onSequenceNumberBlur(event: CustomEvent, newSequenceNumber: string){

    if (!this.checkSequenceNumberValidity(newSequenceNumber)){
      this.milestoneTemplate[this.prevMilestoneIndex].sequenceNumber = this.prevSeqNo
    } else {
      const indexes: { from: number, to: number } = {
        from: this.prevMilestoneIndex,
        to: this.findIndexForNewSequenceNumberPosition(newSequenceNumber)
      }

      // Following three lines reorder the array
      let element = this.milestoneTemplate[indexes.from]
      this.milestoneTemplate.splice(indexes.from, 1)
      this.milestoneTemplate.splice(indexes.to, 0, element)

      this.resetSequenceNumbers()
      this.determineNextSequenceNumber()
    }
  }

  public async onSequenceNumberInput(event: CustomEvent, oldValue: string){
    if (event.detail.inputType === 'insertText') {
      if (event.detail.data === '.') {
        // Only dot is allowed other than number
      } else if (!isNaN(event.detail.data)) { 
        const valueToBeChecked: string = !oldValue ? event.detail.data : `${oldValue}${event.detail.data}`

        if (!this.checkSequenceNumberValidity(valueToBeChecked)){
          // Attempt to cancel the change!
          setTimeout(() => {
            this.milestoneTemplate[this.prevMilestoneIndex].sequenceNumber = oldValue
          }, 0);
          return
        }
      } else {

        // Attempt to cancel the change!
        setTimeout(() => {
          this.milestoneTemplate[this.prevMilestoneIndex].sequenceNumber = oldValue
        }, 0)
        return
      }
    }
  }

  async addMilestone(description: string): Promise<void>{

    //Prevent adding empty descriptions
    if (!description) return

    //Prevent adding invalid sequence number
    if (!this.checkSequenceNumberValidity(this.newSequenceNumber)) return

    const newMilestoneId = await this.db.getNewId()

    const newMilestone: MilestoneTemplabeObject = {
      id: newMilestoneId,
      sequenceNumber: this.newSequenceNumber,
      description: description,
      deadline: null,
    }

    const indexForNewMilestone = this.findIndexForNewSequenceNumberPosition(this.newSequenceNumber)
    this.milestoneTemplate.splice(indexForNewMilestone, 0, newMilestone)

    this.resetSequenceNumbers()

    this.newSequenceNumber = this.incrementSeqNo(this.newSequenceNumber, 1)

    this.addMilestonebar.value = ""
  }

  public async deleteMilestone(sequenceNumber: string): Promise<void> {
    const index: number = this.milestoneTemplate.findIndex(milestone => milestone.sequenceNumber == sequenceNumber)

    // check if milestone has supports -> then give a warning. Supports will be deleted if deleted
    const milestoneId = this.milestoneTemplate[index].id
    const milestone = await this.db.docWithId$<Milestone>(`Goals/${this.goalId}/Milestones/${milestoneId}`).pipe(first()).toPromise()
    
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
          this.milestoneTemplate.splice(index, 1)
          this.resetSequenceNumbers()
          this.newSequenceNumber = this.incrementSeqNo(this.newSequenceNumber, -1)
        }
      })

    } else  {

      // delete milestone
      this.milestoneTemplate.splice(index, 1)
      this.resetSequenceNumbers()
      this.newSequenceNumber = this.incrementSeqNo(this.newSequenceNumber, -1)

    }

   }

  private setInitialSequenceNumber() {
    if (this.milestoneTemplate.length > 0) {
      const lastSeqno = this.milestoneTemplate[this.milestoneTemplate.length - 1].sequenceNumber
      this.newSequenceNumber = this.incrementSeqNo(lastSeqno, 1)
    }
  }

  private incrementSeqNo(sequenceNumber: string, delta: number): string {
    const elements = sequenceNumber.split('.')
    const last = elements.pop()
    elements.push((+last + delta).toString())
    return elements.join('.')
  }

  private findIndexForNewSequenceNumberPosition(sequenceNumber: string): number {
    if (sequenceNumber === '1' && this.milestoneTemplate.length === 0) return 0

    //Check for equal to existing milestone
    const index = this.milestoneTemplate.findIndex(m => m.sequenceNumber === sequenceNumber)
    if (index > -1) return index

    //Need to determine new sequence number
    const elements = sequenceNumber.split('.')
    switch (elements.length) {
      case 1:
        return this.milestoneTemplate.length
      case 2: {
        const parentSeqNo = elements.splice(-1).join('.')
        const index = this.milestoneTemplate.findIndex(m => m.sequenceNumber === this.incrementSeqNo(parentSeqNo, 1))
        return index === -1 ? this.milestoneTemplate.length : index
      }
      case 3: {
        const parentSeqNo = elements.splice(-1).join('.')
        const index = this.milestoneTemplate.findIndex(m => m.sequenceNumber === this.incrementSeqNo(parentSeqNo, 1))
        if (index === -1) {
          const parentOfParentSeqNo = elements.shift()
          const i = this.milestoneTemplate.findIndex(m => m.sequenceNumber === this.incrementSeqNo(parentOfParentSeqNo, 1))
          return i === -1 ? this.milestoneTemplate.length : i
        }
        return index
      }
      default: return 0
    }
  }

  private checkSequenceNumberValidity(sequenceNumber): boolean {

    //Check type
    if (typeof sequenceNumber !== 'string') return false

    const elements = sequenceNumber.split('.')

    //Cannot contain more than three elements / two dots
    if (elements.length > 3) return false

    //Check seqno syntax and length
    if (elements.some(seqNo => !seqNo || isNaN(+seqNo) || +seqNo <= 0)) return false

    //Has to be 1 if there are no milestones yet
    if (this.milestoneTemplate.length === 0 && sequenceNumber !== '1') return false
    if (this.milestoneTemplate.length === 0 && sequenceNumber === "1") return true

    //Can only be equal or one bigger than the previous one
    //Check equal
    if (this.milestoneTemplate.some(m => m.sequenceNumber === sequenceNumber)) return true

    //Check if one bigger
    const last = elements.pop()
    if (last === '1') {
      const parentSeqNo = elements.join('.')
      return this.milestoneTemplate.some(m => m.sequenceNumber === parentSeqNo)
    } else {
      const previousSeqNo = this.incrementSeqNo(sequenceNumber, -1)
      return this.milestoneTemplate.some(m => m.sequenceNumber === previousSeqNo)
    }
  }

  private resetSequenceNumbers(){

    let counter1 = 1
    let counter2 = 1
    let counter3 = 1

    for (const milestone of this.milestoneTemplate) {
      switch (getNrOfDotsInSeqno(milestone.sequenceNumber)) {
        //Level one milestone
        case 0:
          milestone.sequenceNumber = `${counter1}`
              
          counter1++
          counter2 = 1
          counter3 = 1
          break
        //Level two milestone
        case 1:
          milestone.sequenceNumber = `${counter1 - 1}.${counter2}`
    
          counter2++
          counter3 = 1
          break
        //Level three milestone
        case 2:
          if (counter2 === 1) {
            // This is triggered when the milestone above is two levels above the new one. Then the (current) seqno gets converted to a level 2 instead of level 3
            // Counter would otherwise already have been increased by 1 in the previous case
            milestone.sequenceNumber = `${counter1 - 1}.${counter2}`
            counter2++
            counter3 = 1

          } else {
            milestone.sequenceNumber = `${counter1 - 1}.${counter2 - 1}.${counter3}`
            counter3++
          }
          break
      }
    }
  }

  private determineNextSequenceNumber() {
    const milestoneTemplate = [...this.milestoneTemplate]

    const elements = this.newSequenceNumber.split('.')
    if (elements.length > 1) {
      const pre = elements.splice(-1).join('.') + '.'
      milestoneTemplate.filter(m => m.sequenceNumber.includes(pre))
    }

    const siblings = milestoneTemplate.filter(m => getNrOfDotsInSeqno(m.sequenceNumber) === 0)
    this.newSequenceNumber = this.incrementSeqNo(siblings.pop().sequenceNumber, 1)
  }

  public getMargin(sequenceNumber: string): string {
    const numberOfDots = getNrOfDotsInSeqno(sequenceNumber)
    return (numberOfDots * 10).toString() + 'px'
  }

  public async _openingDatetime($event, milestone: MilestoneTemplabeObject): Promise<void> {
    event.stopPropagation(); //prevents roadmap from collapsing in or out :)
    
    // empty value
    $event.target.value = ""

    // set min
    $event.target.min = new Date().toISOString()

    // set max
    if (!!this.goal.deadline) $event.target.max = this.goal.deadline

    const elements = milestone.sequenceNumber.split('.')
    if (elements.length !== 1) {
      // if milestone is a submilestone, then max date cannot be later than parent milestone deadline
      const parentSeqNo = elements.splice(-1).join('.')
      const parent = this.milestoneTemplate.find(m => m.sequenceNumber === parentSeqNo)
      if (!!parent.deadline) $event.target.max = parent.deadline
    }
  }

  public onDeadlineDateChange($event, milestone: MilestoneTemplabeObject) {
    milestone.deadline = $event.detail.value
  }
}
