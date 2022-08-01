import { Injectable } from '@angular/core';
// Services
import { FireCollection } from '@strive/utils/services/collection.service';
// Interfaces
import { createMilestone, Milestone } from '@strive/model'
import { Firestore, DocumentSnapshot } from '@angular/fire/firestore';
import { UserService } from '@strive/user/user/+state/user.service';
import { toDate } from '@strive/utils/helpers';

@Injectable({ providedIn: 'root' })
export class MilestoneService extends FireCollection<Milestone> {
  readonly path = 'Goals/:goalId/Milestones';

  constructor(db: Firestore, private user: UserService) {
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Milestone>) {
    return snapshot.exists()
      ? createMilestone(toDate({ ...snapshot.data(), id: snapshot.id, path: snapshot.ref.path }))
      : undefined
  }

  protected toFirestore(milestone: Milestone): Milestone {
    if (milestone.deadline) milestone.deadline = this.setDeadlineToEndOfDay(milestone.deadline)
    milestone.updatedBy = this.user.uid
    return milestone
    // Firebase backend function handles completing submilestones (WITHOUT NOTIFICATION)
    // Firebase backend function milestoneChangeHandler handles sending notification to supporters of milestone
  }

  private setDeadlineToEndOfDay(deadline: string): string {
    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
  }
}
