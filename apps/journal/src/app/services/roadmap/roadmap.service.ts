import { Injectable } from '@angular/core';
// Angularfire
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
// Rxjs
import { take, first } from 'rxjs/operators';
// Services
import { FirestoreService } from '../firestore/firestore.service'
// Interfaces
import { IMilestone, IMilestoneTemplabeObject, enumMilestoneStatus, IMilestonesLeveled } from '../../interfaces/milestone.interface';
import { ITemplate } from 'apps/journal/src/app/interfaces/template.interface';

@Injectable({
  providedIn: 'root'
})
export class RoadmapService {

  milestones: IMilestone[]
  goalIdPassedFromGoal: string
  milestoneDocRef: AngularFirestoreDocument<IMilestone>

  enumMilestoneStatus = enumMilestoneStatus

  constructor(
    private afs: AngularFirestore,
    private db: FirestoreService,
  ) { }

  async getStructuredMilestones(goalId: string): Promise<IMilestonesLeveled[]> {

    const milestones = await this.db.colWithIds$<IMilestone[]>(`Goals/${goalId}/Milestones`, ref => ref.orderBy('sequenceNumber')).pipe(take(1)).toPromise()
    return this.structureMilestones(milestones)

  }

  async getStructuredMilestonesForTemplates(collectiveGoalId: string, templateId: string): Promise<IMilestonesLeveled[]> {

    const template = await this.db.docWithId$<ITemplate>(`CollectiveGoals/${collectiveGoalId}/Templates/${templateId}`).pipe(first()).toPromise()
    return  this.structureMilestones(template.milestoneTemplateObject)

  }

  async getMilestoneWithSeqno(goalId: string, sequenceNumber: string): Promise<IMilestone> {

    const milestoneColObs = await this.db.colWithIds$<IMilestone[]>(`Goals/${goalId}/Milestones`, ref => ref.where('sequenceNumber', '==', sequenceNumber))

    return new Promise<IMilestone>((resolve, reject) => {

      milestoneColObs.pipe(take(1)).subscribe(milestones => {
        if (milestones) {
          if (milestones.length == 1) {
            resolve(milestones[0])
          } else {
            reject(null)
          }
        }
      })

    })

  }

  checkForIncompleteSubmilestones(milestoneId: string): boolean {

    let blnHasUnfinishedSubmilestones: boolean = false
    const index: number = this.milestones.findIndex(milestone => milestone.id == milestoneId)
    const seqno: string = this.milestones[index].sequenceNumber

    const prefix = `${seqno}.`
    const submilestones = this.milestones.filter(milestone => milestone.sequenceNumber.startsWith(prefix))

    for (let milestone of submilestones) {

      if (milestone.status === enumMilestoneStatus.pending) {
        blnHasUnfinishedSubmilestones = true
        break
      }

    }

    return blnHasUnfinishedSubmilestones

  }

  /**
   * 
   * @param goalId goal id of the goal which needs the milestones
   * @param milestoneTemplate 
   */
  async startConversion(goalId: string, milestoneTemplate: IMilestoneTemplabeObject[]): Promise<void> {

    //Get all milestones if they have not been passed from the goal page.
    if (!this.milestones || this.goalIdPassedFromGoal != goalId) {
      
      this.milestones = await this.db.colWithIds$(`Goals/${goalId}/Milestones`).pipe(take(1)).toPromise()

    }

    //Loop through each document
    milestoneTemplate.forEach((milestone, index) => {

      this.milestoneDocRef = this.afs.collection('Goals')
                                      .doc(goalId)
                                      .collection('Milestones')
                                      .doc(milestone.id)

      //UPDATE
      if (this.milestones.some(x => x.id == milestone.id)){
        const index = this.milestones.findIndex(x => x.id == milestone.id)

        //Update only when anything has changed
        if (this.milestones[index].description != milestone.description || this.milestones[index].sequenceNumber != milestone.sequenceNumber || this.milestones[index].deadline != milestone.deadline){
          delete milestone.numberOfDotsInSequenceNumber
          this.milestones[index].deadline = this.milestones[index].deadline ? this.setDeadlineToEndOfDay(this.milestones[index].deadline) : null
          this.db.update(this.milestoneDocRef, milestone)
        }

      } else {

        //ADD
        const newMilestone: IMilestone = <IMilestone>{}
        newMilestone.description = milestone.description
        newMilestone.sequenceNumber = milestone.sequenceNumber
        newMilestone.numberOfCustomSupports = 0
        newMilestone.status = enumMilestoneStatus.pending
        newMilestone.deadline = milestone.deadline ? this.setDeadlineToEndOfDay(milestone.deadline) : null
        
        this.db.set(this.milestoneDocRef, newMilestone)

      }

    })
    
    //DELETE
    this.milestones.forEach(milestone => {
      
      if (!milestoneTemplate.some(x => x.id == milestone.id)){

        this.afs.collection('Goals')
                .doc(goalId)
                .collection('Milestones')
                .doc(milestone.id)
                .delete()

      }

    })

  }

  async duplicateMilestones(goalId: string, milestoneTemplate: IMilestoneTemplabeObject[]): Promise<void> {

    const promises: any[] = []

    milestoneTemplate.forEach(milestone => {

      const newMilestone: IMilestone = <IMilestone>{}
      newMilestone.description = milestone.description
      newMilestone.sequenceNumber = milestone.sequenceNumber
      newMilestone.numberOfCustomSupports = 0
      newMilestone.status = enumMilestoneStatus.pending
      newMilestone.deadline = milestone.deadline || null

      const promise = this.db.set(`Goals/${goalId}/Milestones/${milestone.id}`, newMilestone)
      promises.push(promise)

    })

    Promise.all(promises)

  }

  structureMilestones(milestones): IMilestonesLeveled[] {
    
    const structuredMilestones: IMilestonesLeveled[] = []

    let indexMilestoneLevelOne = -1
    let indexMilestoneLevelTwo = -1
    let indexMilestoneLevelThree = -1

    milestones.forEach((milestone) => {

      if ((milestone.sequenceNumber.match(/\./g) || []).length === 2) {

        if (indexMilestoneLevelThree === -1 ){ //The milestones level three property does not exist, so create it
          structuredMilestones[indexMilestoneLevelOne].milestonesLevelTwo[indexMilestoneLevelTwo]["milestonesLevelThree"] = []
        }

        indexMilestoneLevelThree++

        structuredMilestones[indexMilestoneLevelOne].milestonesLevelTwo[indexMilestoneLevelTwo].milestonesLevelThree.push(milestone)
      } else if ((milestone.sequenceNumber.match(/\./g) || []).length === 1){

        if (indexMilestoneLevelTwo == -1 ){ //The milestones level two property does not exist, so create it
          structuredMilestones[indexMilestoneLevelOne]["milestonesLevelTwo"] = []
        }

        //Keep knowledge of index milestone level 1
        indexMilestoneLevelTwo++
        indexMilestoneLevelThree = -1

        structuredMilestones[indexMilestoneLevelOne].milestonesLevelTwo.push(milestone)
      } else {

        //Reset index milestone to this new one
        indexMilestoneLevelOne++
        indexMilestoneLevelTwo = -1
        indexMilestoneLevelThree = -1

        structuredMilestones.push(milestone)
      }

    })

    this.sortMilestonesLevelOne(structuredMilestones)
    this.sortMilestonesLevelTwo(structuredMilestones)
    this.sortMilestonesLevelThree(structuredMilestones)
    
    return structuredMilestones
  }

  private sortMilestonesLevelOne(structuredMilestones: IMilestonesLeveled[]){
    //First sort level one milestones
    structuredMilestones.sort((leftSide, rightSide): number => {

      if (leftSide.sequenceNumber.indexOf(".") > -1 && rightSide.sequenceNumber.indexOf(".") > -1) { //Both sides have dots

        if ((+leftSide.sequenceNumber.substr(0, leftSide.sequenceNumber.indexOf("."))) < +rightSide.sequenceNumber.substr(0, rightSide.sequenceNumber.indexOf("."))) return -1
        if (+leftSide.sequenceNumber.substr(0, leftSide.sequenceNumber.indexOf(".")) > +rightSide.sequenceNumber.substr(0, rightSide.sequenceNumber.indexOf("."))) return +1 
        return 0

      } else if (leftSide.sequenceNumber.indexOf(".") > -1) { //Only left side has dots

        if ((+leftSide.sequenceNumber.substr(0, leftSide.sequenceNumber.indexOf("."))) < +rightSide.sequenceNumber) return -1
        if (+leftSide.sequenceNumber.substr(0, leftSide.sequenceNumber.indexOf(".")) > +rightSide.sequenceNumber) return +1 
        return 0

      } else if (rightSide.sequenceNumber.indexOf(".") > -1) { //Only right side has dots

        if (+leftSide.sequenceNumber < +rightSide.sequenceNumber.substr(0, rightSide.sequenceNumber.indexOf("."))) return -1
        if (+leftSide.sequenceNumber > +rightSide.sequenceNumber.substr(0, rightSide.sequenceNumber.indexOf("."))) return +1 
        return 0

      } else { //No sides have dots
        
        if (+leftSide.sequenceNumber < +rightSide.sequenceNumber) return -1
        if (+leftSide.sequenceNumber > +rightSide.sequenceNumber) return +1 
        return 0

      }
    })
  }

  private sortMilestonesLevelTwo(structuredMilestones: IMilestonesLeveled[]){
    //Then loop through milestones level two for each milestone level one
    structuredMilestones.forEach((milestone, index) => {

      if (milestone.milestonesLevelTwo !== undefined) { 

        milestone.milestonesLevelTwo.sort((leftSide, rightSide): number => {

          //Check whether sequencenumber has a second dot
          if ((leftSide.sequenceNumber.match(/\./g) || []).length === 2 && (rightSide.sequenceNumber.match(/\./g) || []).length === 2) { //Both sides have a second dot

            if (+leftSide.sequenceNumber.substring(leftSide.sequenceNumber.indexOf(".") + 1, leftSide.sequenceNumber.lastIndexOf(".")) < +rightSide.sequenceNumber.substring(rightSide.sequenceNumber.indexOf(".") + 1, rightSide.sequenceNumber.lastIndexOf("."))) return -1
            if (+leftSide.sequenceNumber.substring(leftSide.sequenceNumber.indexOf(".") + 1, leftSide.sequenceNumber.lastIndexOf(".")) > +rightSide.sequenceNumber.substring(rightSide.sequenceNumber.indexOf(".") + 1, rightSide.sequenceNumber.lastIndexOf("."))) return +1
            return 0

          } else if ((leftSide.sequenceNumber.match(/\./g) || []).length === 2) { //Only left side has a second dot

            if (+leftSide.sequenceNumber.substring(leftSide.sequenceNumber.indexOf(".") + 1, leftSide.sequenceNumber.lastIndexOf(".")) < +rightSide.sequenceNumber.substr(rightSide.sequenceNumber.indexOf(".") + 1)) return -1
            if (+leftSide.sequenceNumber.substring(leftSide.sequenceNumber.indexOf(".") + 1, leftSide.sequenceNumber.lastIndexOf(".")) > +rightSide.sequenceNumber.substr(rightSide.sequenceNumber.indexOf(".") + 1)) return +1
            return 0

          } else if ((rightSide.sequenceNumber.match(/\./g) || []).length === 2) { //Only right side has a second dot

            if (+leftSide.sequenceNumber.substring(leftSide.sequenceNumber.indexOf(".") + 1) < +rightSide.sequenceNumber.substring(rightSide.sequenceNumber.indexOf(".") + 1, rightSide.sequenceNumber.lastIndexOf("."))) return -1
            if (+leftSide.sequenceNumber.substring(leftSide.sequenceNumber.indexOf(".") + 1) > +rightSide.sequenceNumber.substring(rightSide.sequenceNumber.indexOf(".") + 1, rightSide.sequenceNumber.lastIndexOf("."))) return +1
            return 0

          } else { //No sides have a second dot

            if (+leftSide.sequenceNumber.substr(leftSide.sequenceNumber.indexOf(".") + 1) < +rightSide.sequenceNumber.substr(rightSide.sequenceNumber.indexOf(".") + 1)) return -1
            if (+leftSide.sequenceNumber.substr(leftSide.sequenceNumber.indexOf(".") + 1) > +rightSide.sequenceNumber.substr(rightSide.sequenceNumber.indexOf(".") + 1)) return +1
            return 0

          }
        })
      }
    })
  }

  private sortMilestonesLevelThree(structuredMilestones: IMilestonesLeveled[]){
    //Milestones level three
    structuredMilestones.forEach((milestoneLevelOne) => {
      if (milestoneLevelOne.milestonesLevelTwo !== undefined) {
        milestoneLevelOne.milestonesLevelTwo.forEach((milestoneLevelTwo) => {
          if (milestoneLevelTwo.milestonesLevelThree !== undefined) {
            
            //Sort milestones level three
            milestoneLevelTwo.milestonesLevelThree.sort((leftSide, rightSide): number => {

              if (+leftSide.sequenceNumber.substr(leftSide.sequenceNumber.lastIndexOf(".") + 1) < +rightSide.sequenceNumber.substr(rightSide.sequenceNumber.lastIndexOf(".") + 1)) return -1
              if (+leftSide.sequenceNumber.substr(leftSide.sequenceNumber.lastIndexOf(".") + 1) > +rightSide.sequenceNumber.substr(rightSide.sequenceNumber.lastIndexOf(".") + 1)) return +1
              return 0
  
            })

          }
        })
      }
    })
  }

  private setDeadlineToEndOfDay(deadline: string): string {

    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()

  }

}
