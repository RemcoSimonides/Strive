import { Injectable } from '@angular/core';
import { Firestore, DocumentSnapshot, getDoc, QueryConstraint, orderBy, where, WriteBatch } from '@angular/fire/firestore';
// Rxjs
import { Observable, combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// Interfaces
import { CollectiveGoalStakeholder, createCollectiveGoalStakeholder } from './stakeholder.firestore';
import { CollectiveGoal } from '../../collective-goal/+state/collective-goal.firestore';
import { Profile } from '@strive/user/user/+state/user.firestore';
import { FireCollection, WriteOptions } from '@strive/utils/services/collection.service';
import { FirestoreService } from '@strive/utils/services/firestore.service';
import { UserService } from '@strive/user/user/+state/user.service';

@Injectable({ providedIn: 'root' })
export class CollectiveGoalStakeholderService extends FireCollection<CollectiveGoalStakeholder> {
  readonly path = 'CollectiveGoals/:collectiveGoalId/CGStakeholders'
  readonly idKey = 'uid'

  constructor(
    db: Firestore,
    private fire: FirestoreService,
    private user: UserService) {
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

  public getCollectiveGoals(uid: string, isSecret?: boolean): Observable<CollectiveGoal[]> {
    let constraints: QueryConstraint[]
    if (isSecret !== undefined) {
      constraints = [where('uid', '==', uid), where('collectiveGoalIsSecret', '==', isSecret), orderBy('createdAt', 'desc')]
    } else {
      constraints = [where('uid', '==', uid), orderBy('createdAt', 'desc')]
    }

    return this.groupChanges(constraints).pipe(
      switchMap(stakeholders => {
        const ids = stakeholders.map(stakeholder => stakeholder.collectiveGoalId)
        const observables = ids.map(id => this.fire.docWithId$<CollectiveGoal>(`CollectiveGoals/${id}`))
        return observables.length ? combineLatest<CollectiveGoal[]>(observables) : of([])
      })
    )
  }
}

export interface roleArgs {
  isAdmin?: boolean
  isAchiever?: boolean
  isSpectator?: boolean
}