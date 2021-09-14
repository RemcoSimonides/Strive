import { Injectable } from '@angular/core';
// Services
import { MilestoneService } from './milestone.service';
import { TemplateService } from '@strive/template/+state/template.service';
// Interfaces
import { Milestone, MilestonesLeveled, MilestoneTemplate } from '@strive/milestone/+state/milestone.firestore'
import { createMilestone } from '@strive/milestone/+state/milestone.firestore';

import { getNrOfDotsInSeqno } from '@strive/milestone/+state/milestone.model';
import { BehaviorSubject } from 'rxjs';
import { orderBy, where } from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root'
})
export class RoadmapService {

  private _converting = new BehaviorSubject<boolean>(false)
  converting = this._converting.asObservable()

  constructor(
    private milestoneService: MilestoneService,
    private templateService: TemplateService
  ) {}

  async getStructuredMilestones(goalId: string): Promise<MilestonesLeveled[]> {
    const milestones = await this.milestoneService.getValue([orderBy('sequenceNumber')], { goalId })
    return this.structureMilestones(milestones)
  }

  async getStructuredMilestonesForTemplates(collectiveGoalId: string, templateId: string): Promise<MilestonesLeveled[]> {
    const template = await this.templateService.getValue(templateId, { collectiveGoalId })
    return this.structureMilestones(template.roadmapTemplate)
  }

  async getMilestoneWithSeqno(goalId: string, sequenceNumber: string): Promise<Milestone> {
    const milestones = await this.milestoneService.getValue([where('sequenceNumber', '==', sequenceNumber)], { goalId })
    if (!!milestones) return milestones[0]
  }

  /**
   * 
   * @param goalId goal id of the goal which needs the milestones
   * @param milestoneTemplate 
   */
  async startConversion(goalId: string, roadmapTemplate: MilestoneTemplate[]): Promise<void> {
    this._converting.next(true);

    const milestones = await this.milestoneService.getValue({ goalId })
    const promises: Promise<any>[] = []

    for (const milestoneTemplate of roadmapTemplate) {
      // UPDATE
      const milestone = milestones.find(m => m.id === milestoneTemplate.id)
      if (!!milestone) {
        // Update only when anything has changed
        if (milestone.description !== milestoneTemplate.description
         || milestone.sequenceNumber !== milestoneTemplate.sequenceNumber
         || milestone.deadline !== milestoneTemplate.deadline) {
          const promise = this.milestoneService.update(milestoneTemplate, { params: { goalId }})
          promises.push(promise)
        }
      } else {
        // ADD
        const promise = this.milestoneService.add(createMilestone(milestoneTemplate), { params: { goalId }})
        promises.push(promise)
      }
    }

    // DELETE
    const ids = milestones.filter(milestone => !roadmapTemplate.some(m => m.id === milestone.id)).map(milestone => milestone.id)
    const promise = this.milestoneService.remove(ids, { params: { goalId }})
    promises.push(promise)

    Promise.all(promises).then(_ => this._converting.next(false))
  }

  structureMilestones(milestones: Milestone[] | MilestoneTemplate[]): MilestonesLeveled[] {
    const structuredMilestones: MilestonesLeveled[] = []

    let indexMilestoneLevelOne = -1
    let indexMilestoneLevelTwo = -1
    let indexMilestoneLevelThree = -1

    milestones.forEach((milestone: Milestone | MilestoneTemplate) => {

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
