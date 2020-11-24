import { Injectable } from '@angular/core';
// Services
import { FirestoreService } from '../firestore/firestore.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import { Milestone, enumMilestoneStatus } from '@strive/milestone/+state/milestone.firestore'
import { Profile } from '@strive/user/user/+state/user.firestore';

@Injectable({
  providedIn: 'root'
})
export class MilestoneService {

  constructor(
    private db: FirestoreService,
    private user: UserService
  ) { }

  async milestoneStatusChange(goalId: string, milestone: Milestone, status: enumMilestoneStatus): Promise<void> {
  
    //Update status
    await this.db.upsert(`Goals/${goalId}/Milestones/${milestone.id}`, {status: status})

    // Firebase function handles completing submilestones (WITHOUT NOTIFICATION)

    // Firebase function milestoneChangeHandler handles sending notification to supporters of milestone

  }

  async upsert(goalId:  string, milestoneId: string, data: Partial<Milestone>): Promise<void> {

    if (data.deadline) data.deadline = this.setDeadlineToEndOfDay(data.deadline)

    await this.db.upsert(`Goals/${goalId}/Milestones/${milestoneId}`, data)

  }
  
  async assignCurrentUser(goalId: string, milestone: Milestone): Promise<void> {

    const profile: Profile = await this.user.getProfile()
    
    await this.db.upsert(`Goals/${goalId}/Milestones/${milestone.id}`, {
      achieverId: profile.id,
      achieverUsername: profile.username,
      achieverPhotoURL: profile.image
    })
  
  }

  async unassignAchiever(goalId: string, milestone: Milestone): Promise<void> {

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
