import { Injectable } from '@angular/core';
// Angularfire
import { AngularFirestore, QueryFn } from '@angular/fire/firestore';
import { FirestoreService } from '@strive/utils/services/firestore.service';
// Rxjs
import { Observable, combineLatest, of } from 'rxjs';
import { take, switchMap, first, map } from 'rxjs/operators';
// Interfaces
import { Profile } from '@strive/user/user/+state/user.firestore'
import { GoalStakeholder, enumGoalStakeholder, createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'

@Injectable({
  providedIn: 'root'
})
export class GoalStakeholderService {

  constructor(
    private afs: AngularFirestore,
    private db: FirestoreService,
  ) { }

  public getStakeholder$(uid: string, goalId: string): Observable<GoalStakeholder> {
    return this.db.docWithId$<GoalStakeholder>(`Goals/${goalId}/GStakeholders/${uid}`)
  }

  public async getStakeholder(uid: string, goalId: string): Promise<GoalStakeholder | undefined> {
    return this.getStakeholder$(uid, goalId).pipe(take(1)).toPromise();
  }

  public getStakeholders$(goalId: string): Observable<GoalStakeholder[]> {
    return this.db.colWithIds$<GoalStakeholder[]>(`Goals/${goalId}/GStakeholders`)
  }

  public getGoals(uid: string, role: enumGoalStakeholder, publicOnly: boolean): Observable<Goal[]> {
    let query: QueryFn;
    if (publicOnly) {
      query = ref => ref.where('goalPublicity', '==', 'public').where('uid', '==', uid).where(role, '==', true).orderBy('createdAt', 'desc')
    } else {
      query = ref => ref.where('uid', '==', uid).where(role, '==', true).orderBy('createdAt', 'desc')
    }

    return this.db.collectionGroupWithIds$<GoalStakeholder[]>(`GStakeholders`, query).pipe(
      switchMap((stakeholders: GoalStakeholder[])=> {
        const goalIDs = stakeholders.map(stakeholder => stakeholder.goalId)
        const goalDocs = goalIDs.map(id => this.db.docWithId$<Goal>(`Goals/${id}`))

        return goalDocs.length ? combineLatest<Goal[]>(goalDocs) : of([])
      }),
      // Sort finished goals to the end
      map((goals: Goal[]) => goals.sort((a, b) => a.isFinished === b.isFinished ? 0 : a.isFinished ? 1 : -1)),
    )
  }

  public async upsert(uid: string, goalId: string, roles: roleArgs){

    // note: syncing collectiveGoalStakeholder.isAchiever is done by firebase function (goal-stakeholder.ts)
    
    //Set stakeholder reference
    const ref = this.afs.doc<GoalStakeholder>(`Goals/${goalId}/GStakeholders/${uid}`);

    //Check whether the stakeholder exists
    ref.snapshotChanges().pipe(take(1)).toPromise().then(snap => {
      if (snap.payload.exists === false) {
        //Stakeholder does not exist -> create new
        this.createNewStakeholder(uid, goalId, roles)
      } else {
        //Stakeholder already exists -> set role to roleStatus and update
        this.db.update(ref, roles)
      }
    })
  }

  private async createNewStakeholder(uid: string, goalId: string, roles: roleArgs) {

    const [profile, goal] = await Promise.all([
      this.db.docWithId$<Profile>(`Users/${uid}/Profile/${uid}`).pipe(first()).toPromise(),
      this.db.docWithId$<Goal>(`Goals/${goalId}`).pipe(first()).toPromise()
    ])

    const stakeholder = createGoalStakeholder({
      uid,
      goalId,
      goalTitle: goal.title,
      goalPublicity: goal.publicity,
      goalIsFinished: goal.isFinished,
      goalImage: goal.image,
      ...profile,
      ...roles
    })

    return await this.db.set(`Goals/${goalId}/GStakeholders/${uid}`, stakeholder)
  }
}

export interface roleArgs {
  isAdmin?: boolean;
  isAchiever?: boolean;
  isSupporter?: boolean;
  isSpectator?: boolean;
  hasOpenRequestToJoin?: boolean;
}