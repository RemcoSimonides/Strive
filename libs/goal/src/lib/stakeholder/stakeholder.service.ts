import { Injectable } from '@angular/core'
import { DocumentSnapshot, getDoc, serverTimestamp, doc, WriteBatch } from 'firebase/firestore'
import { toDate, WriteOptions, FireSubCollection } from 'ngfire'

import { AuthService } from '@strive/user/auth/auth.service'

import { Goal, GoalStakeholder, createGoalStakeholder, User, createUser, createGoal } from '@strive/model'

export interface roleArgs {
  isAdmin?: boolean;
  isAchiever?: boolean;
  isSupporter?: boolean;
  isSpectator?: boolean;
  hasOpenRequestToJoin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GoalStakeholderService extends FireSubCollection<GoalStakeholder> {
  readonly path = 'Goals/:goalId/GStakeholders'
  override readonly idKey = 'uid'

  constructor(private auth: AuthService) {
    super()
  }

  override fromFirestore(snapshot: DocumentSnapshot<GoalStakeholder>) {
    return snapshot.exists()
      ? createGoalStakeholder(toDate({ ...snapshot.data(), uid: snapshot.id, path: snapshot.ref.path }))
      : undefined
  }

  override toFirestore(stakeholder: GoalStakeholder): GoalStakeholder {
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

  override async onCreate(stakeholder: GoalStakeholder, { write, params }: WriteOptions) {
    const goalId = params?.['goalId'] ?? stakeholder.goalId
    const uid = stakeholder.uid

    const [user, goal] = await Promise.all([
      getDoc(doc(this.db, `Users/${uid}`)).then(snap => createUser(snap.data())),
      getDoc(doc(this.db, `Goals/${goalId}`)).then(snap => createGoal(snap.data()))
    ])

    if (goal.id) {
      stakeholder.goalPublicity = goal.publicity
    }

    const ref = this.getRef(uid, { goalId })
    const data = createGoalStakeholder({
      ...stakeholder,
      username: user.username,
      photoURL: user.photoURL,
      uid,
      lastCheckedGoal: serverTimestamp() as any,
      lastCheckedChat: serverTimestamp() as any,
      goalId
    });
    (write as WriteBatch).update(ref, { ...data })
  }
}