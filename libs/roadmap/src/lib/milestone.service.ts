import { Injectable, inject } from '@angular/core'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'

import { AuthService } from '@strive/auth/auth.service'

import { createMilestone, Milestone } from '@strive/model'
import { endOfDay } from 'date-fns'

@Injectable({ providedIn: 'root' })
export class MilestoneService extends FireSubCollection<Milestone> {
  private auth = inject(AuthService);

  readonly path = 'Goals/:goalId/Milestones'
  override readonly memorize = false

  constructor() {
    super()
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Milestone>) {
    return snapshot.exists()
      ? createMilestone(toDate({ ...snapshot.data(), id: snapshot.id, path: snapshot.ref.path }))
      : undefined
  }

  protected override toFirestore(milestone: Milestone, actionType: 'add' | 'update'): Milestone {
    const timestamp = serverTimestamp() as any
    if (milestone.deadline) milestone.deadline = endOfDay(milestone.deadline)
    if (actionType === 'add') milestone.createdAt = timestamp

    milestone.updatedBy = this.auth.uid
    milestone.updatedAt = timestamp

    return milestone
  }
}
