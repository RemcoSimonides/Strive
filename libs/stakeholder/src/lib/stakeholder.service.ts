import { Injectable } from '@angular/core'
import { DocumentSnapshot, getDoc, serverTimestamp, doc } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'

import { AuthService } from '@strive/auth/auth.service'

import { GoalStakeholder, createGoalStakeholder, createGoal } from '@strive/model'

export interface roleArgs {
  isAdmin?: boolean
  isAchiever?: boolean
  isSupporter?: boolean
  isSpectator?: boolean
  hasOpenRequestToJoin?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class GoalStakeholderService extends FireSubCollection<GoalStakeholder> {
  readonly path = 'Goals/:goalId/GStakeholders'
  override readonly idKey = 'uid'
  override readonly memorize = true

  constructor(private auth: AuthService) {
    super()
  }

  override fromFirestore(snapshot: DocumentSnapshot<GoalStakeholder>) {
    return snapshot.exists()
      ? createGoalStakeholder(toDate({ ...snapshot.data(), uid: snapshot.id, path: snapshot.ref.path }))
      : undefined
  }

  override async toFirestore(stakeholder: GoalStakeholder, actionType: 'add' | 'update'): Promise<GoalStakeholder> {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') {
      if (!stakeholder.goalId) { throw new Error('Goal id needs to be defined when creating goal stakeholder') }
      
      // 👇 goal is empty goal object in case this stakeholder is created when goal is created. All stakeholders that join after, should have goal defined
      const goal = await getDoc(doc(this.db, `Goals/${stakeholder.goalId}`)).then(snap => createGoal(snap.data()))
  
      stakeholder = createGoalStakeholder({
        ...stakeholder,
        createdAt: timestamp,
        goalPublicity: goal.id ? goal.publicity : stakeholder.goalPublicity
      })
    }

    stakeholder.updatedAt = timestamp
    stakeholder.updatedBy = this.auth.uid

    return stakeholder
  }

  async updateLastCheckedGoal(goalId: string, uid: string) {
    const stakeholder = await this.load(uid, { goalId })
    if (stakeholder) {
      this.update(uid, {
        lastCheckedGoal: serverTimestamp() as any
      }, { params: { goalId } })
    }
  }

  async updateLastCheckedChat(goalId: string, uid: string) {
    const stakeholder = await this.getValue(uid, { goalId })
    if (stakeholder) {
      this.update(uid, {
        lastCheckedChat: serverTimestamp() as any
      }, { params: { goalId }})
    }
  }
}