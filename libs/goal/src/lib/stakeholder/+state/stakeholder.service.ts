import { Injectable } from '@angular/core';
// Angularfire
import { Firestore, DocumentSnapshot, getDoc, WriteBatch } from '@angular/fire/firestore';
import { FireCollection, WriteOptions } from '@strive/utils/services/collection.service';
// Interfaces
import { Profile } from '@strive/user/user/+state/user.firestore'
import { GoalStakeholder, createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
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
    return snapshot.exists
      ? { ...snapshot.data(), uid: snapshot.id, path: snapshot.ref.path }
      : undefined
  }

  toFirestore(stakeholder: GoalStakeholder): GoalStakeholder {
    stakeholder.updatedBy = this.user.uid
    return stakeholder
  }

  async onCreate(stakeholder: GoalStakeholder, { write, params }: WriteOptions) {
    const goalId = params?.goalId ? params.goalId : stakeholder.goalId
    const uid = stakeholder.uid

    const [profile, goal] = await Promise.all([
      getDoc(this.typedDocument<Profile>(this.db, `Users/${uid}/Profile/${uid}`)).then(snap => snap.data()),
      getDoc(this.typedDocument<Goal>(this.db, `Goals/${goalId}`)).then(snap => snap.data())
    ])

    if (!!goal) {
      stakeholder.goalTitle = goal.title
      stakeholder.goalPublicity = goal.publicity;
      stakeholder.goalIsFinished = goal.isFinished;
      stakeholder.goalImage = goal.image;
    }

    const ref = this.getRef(uid, { goalId })
    const data = createGoalStakeholder({
      ...stakeholder,  
      username: profile.username,
      photoURL: profile.photoURL,
      uid,
      goalId
    });
    (write as WriteBatch).update(ref, { ...data })
  }
}