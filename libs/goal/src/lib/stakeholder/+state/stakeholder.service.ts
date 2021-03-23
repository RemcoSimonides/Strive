import { Injectable } from '@angular/core';
// Angularfire
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { FireCollection, WriteOptions } from '@strive/utils/services/collection.service';
// Rxjs
import { take } from 'rxjs/operators';
// Interfaces
import { createProfileLink } from '@strive/user/user/+state/user.firestore'
import { GoalStakeholder, createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'

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

  constructor(db: AngularFirestore) {
    super(db)
  }

  fromFirestore(snapshot: DocumentSnapshot<GoalStakeholder>) {
    return snapshot.exists
      ? { ...snapshot.data(), id: snapshot.id, path: snapshot.ref.path }
      : undefined
  }

  async onCreate(stakeholder: GoalStakeholder, { write, params }: WriteOptions) {
    const goalId = params?.goalId ? params.goalId : stakeholder.goalId
    const uid = stakeholder.uid

    const [profile, goal] = await Promise.all([
      this.db.doc(`Users/${uid}/Profile/${uid}`).valueChanges().pipe(take(1)).toPromise(),
      this.db.doc<Goal>(`Goals/${goalId}`).valueChanges().pipe(take(1)).toPromise()
    ])

    if (!!goal) {
      stakeholder.goalTitle = goal.title
      stakeholder.goalPublicity = goal.publicity;
      stakeholder.goalIsFinished = goal.isFinished;
      stakeholder.goalImage = goal.image;
    }

    const ref = this.getRef(uid, { goalId })
    write.update(ref, createGoalStakeholder({
        ...stakeholder,  
        ...createProfileLink(profile),
        uid,
        goalId,
      })
    )
  }
}