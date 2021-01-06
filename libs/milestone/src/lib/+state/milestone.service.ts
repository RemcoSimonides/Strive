import { Injectable } from '@angular/core';
// Services
import { FirestoreService } from '@strive/utils/services/firestore.service';
// Interfaces
import { Milestone } from '@strive/milestone/+state/milestone.firestore'

@Injectable({ providedIn: 'root' })
export class MilestoneService {

  constructor(private db: FirestoreService) { }

  async upsert(goalId:  string, milestoneId: string, data: Partial<Milestone>) {
    if (!!data.deadline) data.deadline = this.setDeadlineToEndOfDay(data.deadline)
    await this.db.upsert(`Goals/${goalId}/Milestones/${milestoneId}`, data)

    // Firebase backend function handles completing submilestones (WITHOUT NOTIFICATION)
    // Firebase backend function milestoneChangeHandler handles sending notification to supporters of milestone
  }

  private setDeadlineToEndOfDay(deadline: string): string {
    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
  }
}
