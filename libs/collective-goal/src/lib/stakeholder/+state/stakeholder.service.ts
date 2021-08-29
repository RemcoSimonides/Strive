import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot, QueryGroupFn } from '@angular/fire/firestore';
// Rxjs
import { Observable, combineLatest, of } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';
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
    db: AngularFirestore,
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
      this.db.doc<Profile>(`Users/${uid}/Profile/${uid}`).valueChanges().pipe(take(1)).toPromise(),
      this.db.doc<CollectiveGoal>(`CollectiveGoals/${collectiveGoalId}`).valueChanges().pipe(take(1)).toPromise()
    ])

    if (collectiveGoal) {
      stakeholder.collectiveGoalTitle = collectiveGoal.title ?? ''
      stakeholder.collectiveGoalIsSecret = collectiveGoal.isSecret ?? false
    }

    const ref = this.getRef(uid, { collectiveGoalId })
    write.update(ref, createCollectiveGoalStakeholder({
      ...stakeholder,
      username: profile.username,
      photoURL: profile.photoURL,
      uid,
      collectiveGoalId
    }))
  }

  public getCollectiveGoals(uid: string, isSecret?: boolean): Observable<CollectiveGoal[]> {
    let query: QueryGroupFn<CollectiveGoalStakeholder>
    if (isSecret !== undefined) {
      query = ref => ref.where('uid', '==', uid).where('collectiveGoalIsSecret', '==', isSecret).orderBy('createdAt', 'desc')
    } else {
      query = ref => ref.where('uid', '==', uid).orderBy('createdAt', 'desc')
    }

    return this.groupChanges(query).pipe(
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