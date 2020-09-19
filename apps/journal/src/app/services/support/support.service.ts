import { Injectable } from '@angular/core';
// Angularfire
import { AngularFireAuth } from '@angular/fire/auth';
// Services
import { FirestoreService } from '../firestore/firestore.service';
import { RoadmapService } from '../roadmap/roadmap.service';
// Interfaces
import {
  IGoal,
  IMilestone,
  ISupport,
  enumSupportStatus,
  enumSupportDecision,
  INotificationSupport
} from '@strive/interfaces';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  constructor(
    private afAuth: AngularFireAuth,
    private db: FirestoreService,
    private roadmapService: RoadmapService
  ) { }


  async changeSupportStatus(goalId: string, supportId: string, status: enumSupportStatus): Promise<void> {

    this.db.upsert(`Goals/${goalId}/Supports/${supportId}`, {
      status: status
    })

  }

  async changeSupportStatusDependantOnDecision(goalId: string, supports: INotificationSupport[]): Promise<void> {

    supports.forEach(support => {

      if (support.decision === enumSupportDecision.give) {
        
        this.changeSupportStatus(goalId, support.id, enumSupportStatus.waiting_for_receiver)
  
      } else if (support.decision === enumSupportDecision.keep) {
  
        this.changeSupportStatus(goalId, support.id, enumSupportStatus.rejected)
  
      }  

    })

  }

  /**
   * @param goal Goal has to include id
   */
  async createCustomMilestoneSupport(goal: IGoal, milestone: IMilestone, newSupport: string): Promise<void> {
    
    const newCustomSupport = <ISupport>{}
    const currentUser = await this.afAuth.currentUser;

    delete newCustomSupport.id
    delete newCustomSupport.amount
    delete newCustomSupport.receiver

    newCustomSupport.description = newSupport
    newCustomSupport.status = enumSupportStatus.open
    
    newCustomSupport.supporter = {
      uid: currentUser.uid,
      username: currentUser.displayName,
      photoURL: currentUser.photoURL
    }

    newCustomSupport.goal = {
      id: goal.id,
      title: goal.title,
      image: goal.image
    }

    newCustomSupport.milestone = {
      id: milestone.id,
      description: milestone.description
    }

    await this.determinePath(goal.id, milestone.sequenceNumber, newCustomSupport)

    this.db.add(`Goals/${goal.id}/Supports`, newCustomSupport)

  }

  async createCustomGoalSupport(goal: IGoal, newSupport: string): Promise<void> {

    const newCustomSupport = <ISupport>{}
    const currentUser = await this.afAuth.currentUser;

    delete newCustomSupport.id
    delete newCustomSupport.amount
    delete newCustomSupport.path
    delete newCustomSupport.receiver

    newCustomSupport.description = newSupport
    newCustomSupport.status = enumSupportStatus.open
    
    newCustomSupport.supporter = {
      uid: currentUser.uid,
      username: currentUser.displayName,
      photoURL: currentUser.photoURL
    }

    newCustomSupport.goal = {
      id: goal.id,
      title: goal.title,
      image: goal.image
    }

    newCustomSupport.milestone = null

    this.db.add(`Goals/${goal.id}/Supports`, newCustomSupport)

  }

  async determinePath(goalId: string, sequenceNumber: string, newSupport: ISupport): Promise<ISupport> {

    let nrOfDotsInSeqNo: number = (sequenceNumber.match(/\./g) || []).length
    newSupport.path = {
      level1description: '',
      level1id: '',
      level2description: '',
      level2id: '',
      level3description: '',
      level3id: ''
    }

    switch (nrOfDotsInSeqNo) {
      case 2: {
        // Als het twee punten bevat: level 3
        let milestone3 = await this.roadmapService.getMilestoneWithSeqno(goalId, sequenceNumber)
        newSupport.path.level3id = milestone3.id 
        newSupport.path.level3description = milestone3.description
        
      }
      case 1: {
        // Vind milestone met seqno 1.2
        if (nrOfDotsInSeqNo == 2) {
          sequenceNumber = sequenceNumber.substr(0, sequenceNumber.lastIndexOf('.'))
        }

        let milestone2 = await this.roadmapService.getMilestoneWithSeqno(goalId, sequenceNumber)
        newSupport.path.level2id = milestone2.id
        newSupport.path.level2description = milestone2.description

      }
      case 0: {
        // Vind milestone met seqno 1
        if (sequenceNumber.indexOf('.') !== -1) {
          sequenceNumber = sequenceNumber.substr(0, sequenceNumber.indexOf('.'))
        }

        let milestone1 = await this.roadmapService.getMilestoneWithSeqno(goalId, sequenceNumber)
        newSupport.path.level1id = milestone1.id
        newSupport.path.level1description = milestone1.description

      }
    }

    if (!newSupport.path.level3id) {
      delete newSupport.path.level3id
      delete newSupport.path.level3description
    }

    if (!newSupport.path.level2id) {
      delete newSupport.path.level2id
      delete newSupport.path.level2description
    }
    
    return newSupport

  }


}
