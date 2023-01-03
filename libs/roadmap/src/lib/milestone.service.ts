import { Injectable } from '@angular/core'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'

import { AuthService } from '@strive/user/auth/auth.service'

import { createMilestone, Milestone } from '@strive/model'

@Injectable({ providedIn: 'root' })
export class MilestoneService extends FireSubCollection<Milestone> {
  readonly path = 'Goals/:goalId/Milestones'
  override readonly memorize = true

  constructor(private auth: AuthService) {
    super()
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Milestone>) {
    return snapshot.exists()
      ? createMilestone(toDate({ ...snapshot.data(), id: snapshot.id, path: snapshot.ref.path }))
      : undefined
  }

  protected override toFirestore(milestone: Milestone, actionType: 'add' | 'update'): Milestone {
    const timestamp = serverTimestamp() as any
    if (milestone.deadline) milestone.deadline = this.setDeadlineToEndOfDay(milestone.deadline)
    if (actionType === 'add') milestone.createdAt = timestamp

    milestone.updatedBy = this.auth.uid
    milestone.updatedAt = timestamp

    return milestone
  }

  private setDeadlineToEndOfDay(deadline: string): string {
    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
  }
}
