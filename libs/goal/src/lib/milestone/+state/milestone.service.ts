import { Injectable } from '@angular/core';
// Services
import { FireCollection } from '@strive/utils/services/collection.service';
// Interfaces
import { Milestone } from '@strive/goal/milestone/+state/milestone.firestore'
import { Firestore, DocumentSnapshot } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class MilestoneService extends FireCollection<Milestone> {
  readonly path = 'Goals/:goalId/Milestones';

  constructor(db: Firestore) {
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Milestone>) {
    return snapshot.exists()
      ? { ...snapshot.data(), id: snapshot.id, path: snapshot.ref.path }
      : undefined
  }

  protected toFirestore(milestone: Milestone): Milestone {
    if (milestone.deadline) milestone.deadline = this.setDeadlineToEndOfDay(milestone.deadline)
    return milestone
    // Firebase backend function handles completing submilestones (WITHOUT NOTIFICATION)
    // Firebase backend function milestoneChangeHandler handles sending notification to supporters of milestone
  }

  private setDeadlineToEndOfDay(deadline: string): string {
    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
  }
}
