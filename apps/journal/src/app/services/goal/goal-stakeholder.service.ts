import { Injectable } from '@angular/core';
// Angularfire
import { AngularFirestore, QueryFn } from '@angular/fire/firestore';
import { FirestoreService } from '../firestore/firestore.service';
// Rxjs
import { Observable, combineLatest, of } from 'rxjs';
import { take, switchMap, first, map } from 'rxjs/operators';
// Interfaces
import {
  IGoalStakeholder,
  enumGoalStakeholder,
  IGoal,
  enumGoalPublicity
} from '@strive/interfaces';
import { Profile } from '@strive/user/user/+state/user.firestore'

@Injectable({
  providedIn: 'root'
})
export class GoalStakeholderService {

  constructor(
    private afs: AngularFirestore,
    private db: FirestoreService,
  ) { }

  public getStakeholderDocObs(uid: string, goalId: string): Observable<IGoalStakeholder> {
    return this.db.docWithId$<IGoalStakeholder>(`Goals/${goalId}/GStakeholders/${uid}`)
  }

  public async getStakeholder(uid: string, goalId: string): Promise<IGoalStakeholder | undefined> {
    return this.getStakeholderDocObs(uid, goalId).pipe(take(1)).toPromise();
  }

  public getGoals(uid: string, role: enumGoalStakeholder, publicOnly: boolean): Observable<IGoal[]> {
    let query: QueryFn;
    if (publicOnly) {
      query = ref => ref.where('goalPublicity', '==', enumGoalPublicity.public).where('uid', '==', uid).where(role, '==', true).orderBy('createdAt', 'desc')
    } else {
      query = ref => ref.where('uid', '==', uid).where(role, '==', true).orderBy('createdAt', 'desc')
    }

    return this.db.collectionGroupWithIds$<IGoalStakeholder[]>(`GStakeholders`, query).pipe(
      switchMap(stakeholders => {
        const goalIDs = stakeholders.map(stakeholder => stakeholder.goalId)
        const goalDocs = goalIDs.map(id => this.db.docWithId$<IGoal>(`Goals/${id}`))

        return goalDocs.length ? combineLatest<IGoal[]>(goalDocs) : of([])
      }),
      // Sort finished goals to the end
      map((goals: IGoal[]) => goals.sort((a, b) => a.isFinished === b.isFinished ? 0 : a.isFinished ? 1 : -1)),
    )
  }

  public async upsert(uid: string, goalId: string, roles: roleArgs){

    // note: syncing collectiveGoalStakeholder.isAchiever is done by firebase function (goal-stakeholder.ts)
    
    //Set stakeholder reference
    const ref = this.afs.doc<IGoalStakeholder>(`Goals/${goalId}/GStakeholders/${uid}`);

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

  public async delete(goalId: string): Promise<void> {
    await this.db.doc(`Goals/${goalId}`).delete()
  }

  private async createNewStakeholder(uid: string, goalId: string, roles: roleArgs): Promise<void> {

    let newStakeholder = <IGoalStakeholder>{}

    const userProfile = await this.db.docWithId$<Profile>(`Users/${uid}/Profile/${uid}`).pipe(first()).toPromise()
    newStakeholder.uid = uid
    newStakeholder.username = userProfile.username
    newStakeholder.photoURL = userProfile.image
    newStakeholder.isAchiever = roles.isAchiever ? true : false
    newStakeholder.isAdmin = roles.isAdmin ? true : false
    newStakeholder.isSupporter = roles.isSupporter ? true : false
    newStakeholder.isSpectator = roles.isSpectator ? true : false
    newStakeholder.hasOpenRequestToJoin = roles.hasOpenRequestToJoin ? true : false

    const goal = await this.db.docWithId$<IGoal>(`Goals/${goalId}`).pipe(first()).toPromise()
    newStakeholder.goalId = goalId,
    newStakeholder.goalTitle = goal.title,
    newStakeholder.goalPublicity = goal.publicity,
    newStakeholder.goalIsFinished = goal.isFinished,
    newStakeholder.goalImage = goal.image

    await this.db.set(`Goals/${goalId}/GStakeholders/${uid}`, newStakeholder)
  }

}

export interface roleArgs {
  isAdmin?: boolean;
  isAchiever?: boolean;
  isSupporter?: boolean;
  isSpectator?: boolean;
  hasOpenRequestToJoin?: boolean;
}