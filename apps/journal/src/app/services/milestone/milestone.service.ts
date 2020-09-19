import { Injectable } from '@angular/core';
// Services
import { FirestoreService } from '../firestore/firestore.service';
import { AuthService } from '../auth/auth.service';
// Interfaces
import {
  IMilestone,
  enumMilestoneStatus,
  IProfile
} from '@strive/interfaces';

@Injectable({
  providedIn: 'root'
})
export class MilestoneService {

  constructor(
    private authService: AuthService,
    private db: FirestoreService
  ) { }

  async milestoneStatusChange(goalId: string, milestone: IMilestone, status: enumMilestoneStatus): Promise<void> {
  
    //Update status
    await this.db.upsert(`Goals/${goalId}/Milestones/${milestone.id}`, {status: status})

    // Firebase function handles completing submilestones (WITHOUT NOTIFICATION)

    // Firebase function milestoneChangeHandler handles sending notification to supporters of milestone

  }

  async upsert(goalId:  string, milestoneId: string, data: Partial<IMilestone>): Promise<void> {

    if (data.deadline) data.deadline = this.setDeadlineToEndOfDay(data.deadline)

    await this.db.upsert(`Goals/${goalId}/Milestones/${milestoneId}`, data)

  }
  
  async assignCurrentUser(goalId: string, milestone: IMilestone): Promise<void> {

    const userProfile: IProfile = await this.authService.getCurrentUserProfile()
    
    await this.db.upsert(`Goals/${goalId}/Milestones/${milestone.id}`, {
      achieverId: userProfile.id,
      achieverUsername: userProfile.username,
      achieverPhotoURL: userProfile.image
    })
  
  }

  async unassignAchiever(goalId: string, milestone: IMilestone): Promise<void> {

    await this.db.upsert(`Goals/${goalId}/Milestones/${milestone.id}`, {
      achieverId: null,
      achieverUsername: null,
      achieverPhotoURL: null
    })

  }

  private setDeadlineToEndOfDay(deadline: string): string {

    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
    
  }

}
