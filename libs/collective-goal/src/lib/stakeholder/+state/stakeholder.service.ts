import { Injectable } from '@angular/core';
import { Firestore, DocumentSnapshot, getDoc, WriteBatch } from '@angular/fire/firestore';
// Interfaces
import { CollectiveGoalStakeholder, createCollectiveGoalStakeholder } from './stakeholder.firestore';
import { CollectiveGoal } from '../../collective-goal/+state/collective-goal.firestore';
import { Profile } from '@strive/user/user/+state/user.firestore';
import { FireCollection, WriteOptions } from '@strive/utils/services/collection.service';
import { UserService } from '@strive/user/user/+state/user.service';

@Injectable({ providedIn: 'root' })
export class CollectiveGoalStakeholderService extends FireCollection<CollectiveGoalStakeholder> {
  readonly path = 'CollectiveGoals/:collectiveGoalId/CGStakeholders'
  readonly idKey = 'uid'

  constructor(db: Firestore, private user: UserService) {
    super(db)
  }

  fromFirestore(snapshot: DocumentSnapshot<CollectiveGoalStakeholder>) {
    return snapshot.exists
      ? { ...snapshot.data(), uid: snapshot.id, path: snapshot.ref.path }
      : undefined
  }

  toFirestore(stakeholder: CollectiveGoalStakeholder): CollectiveGoalStakeholder {
    stakeholder.updatedBy = this.user.uid
    return stakeholder
  }

  async onCreate(stakeholder: CollectiveGoalStakeholder, { write, params }: WriteOptions) {
    const collectiveGoalId = params?.collectiveGoalId ? params.collectiveGoalId : stakeholder.collectiveGoalId
    const uid = stakeholder.uid

    const [profile, collectiveGoal] = await Promise.all([
      getDoc(this.typedDocument<Profile>(this.db, `Users/${uid}/Profile/${uid}`)).then(snap => snap.data()),
      getDoc(this.typedDocument<CollectiveGoal>(this.db, `CollectiveGoals/${collectiveGoalId}`)).then(snap => snap.data())
    ])

    if (collectiveGoal) {
      stakeholder.collectiveGoalTitle = collectiveGoal.title ?? ''
      stakeholder.collectiveGoalIsSecret = collectiveGoal.isSecret ?? false
    }

    const ref = this.getRef(uid, { collectiveGoalId });
    const data = createCollectiveGoalStakeholder({
      ...stakeholder,
      username: profile.username,
      photoURL: profile.photoURL,
      uid,
      collectiveGoalId
    });

    (write as WriteBatch).update(ref, {...data});
  }
}

export interface roleArgs {
  isAdmin?: boolean
  isAchiever?: boolean
  isSpectator?: boolean
}