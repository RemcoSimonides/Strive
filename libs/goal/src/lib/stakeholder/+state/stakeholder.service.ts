import { Injectable } from '@angular/core';
// Angularfire
import { Firestore, DocumentSnapshot, getDoc, WriteBatch, serverTimestamp } from '@angular/fire/firestore';
import { FireCollection, WriteOptions } from '@strive/utils/services/collection.service';
// Interfaces
import { User } from '@strive/user/user/+state/user.firestore'
import { GoalStakeholder, createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { Goal } from '@strive/model'
import { UserService } from '@strive/user/user/+state/user.service';

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
export class GoalStakeholderService extends FireCollection<GoalStakeholder> {
  readonly path = 'Goals/:goalId/GStakeholders'
  readonly idKey = 'uid'

  constructor(db: Firestore, private user: UserService) {
    super(db)
  }

  fromFirestore(snapshot: DocumentSnapshot<GoalStakeholder>) {
    return snapshot.exists()
      ? { ...snapshot.data(), uid: snapshot.id, path: snapshot.ref.path }
      : undefined
  }

  toFirestore(stakeholder: GoalStakeholder): GoalStakeholder {
    stakeholder.updatedBy = this.user.uid
    return stakeholder
  }

  updateLastCheckedGoal(goalId: string, uid: string) {
    this.update(uid, {
      lastCheckedGoal: serverTimestamp() as any
    }, { params: { goalId } })
  }

  async onCreate(stakeholder: GoalStakeholder, { write, params }: WriteOptions) {
    const goalId = params?.goalId ? params.goalId : stakeholder.goalId
    const uid = stakeholder.uid

    const [user, goal] = await Promise.all([
      getDoc(this.typedDocument<User>(this.db, `Users/${uid}`)).then(snap => snap.data()),
      getDoc(this.typedDocument<Goal>(this.db, `Goals/${goalId}`)).then(snap => snap.data())
    ])

    if (goal) {
      // TODO if max number of active goals, then put in buckeltist if goal is active and user already has max active goals;
      stakeholder.status = goal.status
      stakeholder.goalPublicity = goal.publicity
    }

    const ref = this.getRef(uid, { goalId })
    const data = createGoalStakeholder({
      ...stakeholder,  
      username: user.username,
      photoURL: user.photoURL,
      uid,
      goalId
    });
    (write as WriteBatch).update(ref, { ...data })
  }
}