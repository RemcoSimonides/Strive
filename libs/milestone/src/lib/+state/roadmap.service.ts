import { Injectable } from '@angular/core';
// Angularfire
import { AngularFirestore } from '@angular/fire/firestore';
// Rxjs
import { take, first } from 'rxjs/operators';
// Services
import { FirestoreService } from '@strive/utils/services/firestore.service';
// Interfaces
import { ITemplate } from '@strive/interfaces';
import { Milestone, enumMilestoneStatus, MilestonesLeveled, MilestoneTemplabeObject } from '@strive/milestone/+state/milestone.firestore'
import { createMilestone } from '@strive/milestone/+state/milestone.firestore';

import { setDateToEndOfDay } from '@strive/utils/helpers'
import { getNrOfDotsInSeqno } from '@strive/milestone/+state/milestone.model';
@Injectable({
  providedIn: 'root'
})
export class RoadmapService {

  milestones: Milestone[]

  enumMilestoneStatus = enumMilestoneStatus

  constructor(
    private afs: AngularFirestore,
    private db: FirestoreService,
  ) { }

  async getStructuredMilestones(goalId: string): Promise<MilestonesLeveled[]> {
    const milestones = await this.db.colWithIds$<Milestone[]>(`Goals/${goalId}/Milestones`, ref => ref.orderBy('sequenceNumber')).pipe(take(1)).toPromise()
    return this.structureMilestones(milestones)
  }

  async getStructuredMilestonesForTemplates(collectiveGoalId: string, templateId: string): Promise<MilestonesLeveled[]> {
    const template = await this.db.docWithId$<ITemplate>(`CollectiveGoals/${collectiveGoalId}/Templates/${templateId}`).pipe(first()).toPromise()
    return this.structureMilestones(template.milestoneTemplateObject)
  }

  async getMilestoneWithSeqno(goalId: string, sequenceNumber: string): Promise<Milestone> {
    const milestoneColObs = this.db.colWithIds$<Milestone[]>(`Goals/${goalId}/Milestones`, ref => ref.where('sequenceNumber', '==', sequenceNumber))

    return new Promise<Milestone>((resolve, reject) => {
      milestoneColObs.pipe(take(1)).subscribe(milestones => !!milestones && milestones.length === 1 ? resolve(milestones[0]) : reject())
    })
  }

  checkForIncompleteSubmilestones(milestoneId: string): boolean {

    if (!this.milestones) throw new Error('No milestones in class!')

    const seqno = this.milestones.find(milestone => milestone.id == milestoneId).sequenceNumber
    const prefix = `${seqno}.`
    const submilestones = this.milestones.filter(milestone => milestone.sequenceNumber.startsWith(prefix))
    return submilestones.some(milestone => milestone.status === enumMilestoneStatus.pending)
  }

  /**
   * 
   * @param goalId goal id of the goal which needs the milestones
   * @param milestoneTemplate 
   */
  async startConversion(goalId: string, milestoneTemplate: MilestoneTemplabeObject[]): Promise<void> {

    //Get all milestones if they have not been passed from the goal page.
    if (!this.milestones) {
      this.milestones = await this.db.colWithIds$(`Goals/${goalId}/Milestones`).pipe(take(1)).toPromise()
    }

    milestoneTemplate.forEach(milestone => {

      const milestoneDocRef = this.afs.doc(`Goals/${goalId}/Milestones/${milestone.id}`)

      //UPDATE
      if (this.milestones.some(x => x.id == milestone.id)){
        const index = this.milestones.findIndex(x => x.id == milestone.id)

        //Update only when anything has changed
        if (this.milestones[index].description !== milestone.description || this.milestones[index].sequenceNumber !== milestone.sequenceNumber || this.milestones[index].deadline !== milestone.deadline){
          this.milestones[index].deadline = this.milestones[index].deadline ? setDateToEndOfDay(this.milestones[index].deadline) : null
          this.db.update(milestoneDocRef, milestone)
        }

      } else {

        //ADD
        const newMilestone = createMilestone(milestone)
        this.db.set(milestoneDocRef, newMilestone)
      }
    })
    
    //DELETE
    this.milestones.forEach(milestone => {
      if (!milestoneTemplate.some(x => x.id == milestone.id)){
        this.afs.doc(`Goals/${goalId}/Milestones/${milestone.id}`).delete
      }
    })

  }

  async duplicateMilestones(goalId: string, milestoneTemplate: MilestoneTemplabeObject[]): Promise<void> {
    const promises: any[] = []
    milestoneTemplate.forEach(milestone => {
      const newMilestone = createMilestone(milestone)
      const promise = this.db.set(`Goals/${goalId}/Milestones/${milestone.id}`, newMilestone)
      promises.push(promise)
    })
    Promise.all(promises)
  }

  structureMilestones(milestones: Milestone[] | MilestoneTemplabeObject[]): MilestonesLeveled[] {
    
    const structuredMilestones: MilestonesLeveled[] = []
    console.log('structured milestones: ', structuredMilestones)

    let indexMilestoneLevelOne = -1
    let indexMilestoneLevelTwo = -1
    let indexMilestoneLevelThree = -1

    milestones.forEach((milestone: Milestone | MilestoneTemplabeObject) => {

      if (getNrOfDotsInSeqno(milestone.sequenceNumber) === 2) {

        if (indexMilestoneLevelThree === -1 ){ //The milestones level three property does not exist, so create it
          structuredMilestones[indexMilestoneLevelOne].submilestones[indexMilestoneLevelTwo]["submilestones"] = []
        }

        indexMilestoneLevelThree++

        structuredMilestones[indexMilestoneLevelOne].submilestones[indexMilestoneLevelTwo].submilestones.push(createMilestone(milestone))
      } else if (getNrOfDotsInSeqno(milestone.sequenceNumber) === 1){

        if (indexMilestoneLevelTwo == -1 ){ //The milestones level two property does not exist, so create it
          structuredMilestones[indexMilestoneLevelOne]["submilestones"] = []
        }

        //Keep knowledge of index milestone level 1
        indexMilestoneLevelTwo++
        indexMilestoneLevelThree = -1

        structuredMilestones[indexMilestoneLevelOne].submilestones.push(createMilestone(milestone))
      } else {

        //Reset index milestone to this new one
        indexMilestoneLevelOne++
        indexMilestoneLevelTwo = -1
        indexMilestoneLevelThree = -1

        structuredMilestones.push(createMilestone(milestone))
      }
    })

    //First sort level one milestones
    structuredMilestones.sort((left, right) => this.sortMilestones(left, right, 0))
    //Then loop through milestones level two for each milestone level one
    structuredMilestones.forEach(milestone => {
      if (!!milestone.submilestones && !!milestone.submilestones.length) {
        milestone.submilestones.sort((left, right) => this.sortMilestones(left, right, 1))
      }
    })
    // At last sort the third and last level of submilestones
    structuredMilestones.forEach(milestoneLevelOne => {
      if (!!milestoneLevelOne.submilestones && !!milestoneLevelOne.submilestones.length) {
        milestoneLevelOne.submilestones.forEach(milestoneLevelTwo => {
          if (!!milestoneLevelTwo.submilestones && !!milestoneLevelTwo.submilestones.length) {
            milestoneLevelTwo.submilestones.sort((left, right) => this.sortMilestones(left, right, 2))
          }
        })
      }
    })
    
    return structuredMilestones
  }

  private sortMilestones(leftMilestone: Milestone, rightMilestone: Milestone, part: 0|1|2) {
    const getPart = (seqNo: string) => +seqNo.split('.')[part];

    const left = getPart(leftMilestone.sequenceNumber)
    const right = getPart(rightMilestone.sequenceNumber)

    if (left < right) return -1
    if (left > right) return 1
    return 0
  }
}
