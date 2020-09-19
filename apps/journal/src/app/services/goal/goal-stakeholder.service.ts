import { Injectable } from '@angular/core';
// Angularfire
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { FirestoreService } from '../firestore/firestore.service';
// Rxjs
import { Observable, combineLatest, of } from 'rxjs';
import { take, switchMap, first } from 'rxjs/operators';
// Interfaces
import {
  IGoalStakeholder,
  enumGoalStakeholder,
  IGoal,
  enumGoalPublicity,
  IProfile
} from '@strive/interfaces';

@Injectable({
  providedIn: 'root'
})
export class GoalStakeholderService {

  stakeholder: IGoalStakeholder

  isAdmin: boolean = false
  isAchiever: boolean = false
  isSupporter: boolean = false

  private stakeholderDocRef: AngularFirestoreDocument<IGoalStakeholder>
  private stakeholderDocObs: Observable<IGoalStakeholder>

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private db: FirestoreService,
  ) { }

  public async init(goalId: string) {

    const uid = (await this.afAuth.currentUser).uid;
    this.stakeholderDocObs = this.db.doc$<IGoalStakeholder>(`Goals/${goalId}/GStakeholders/${uid}`)
    this.stakeholderDocObs.subscribe(stakeholder => {

      if (stakeholder) {

        stakeholder.isAdmin ? this.isAdmin = stakeholder.isAdmin : this.isAdmin = false
        stakeholder.isAchiever ? this.isAchiever = stakeholder.isAchiever : this.isAchiever = false
        stakeholder.isSupporter ? this.isSupporter = stakeholder.isSupporter : this.isSupporter = false
        
      }
      
    })

  }

  public getStakeholderDocObs(uid: string, goalId: string): Observable<IGoalStakeholder> {

    return this.db.docWithId$<IGoalStakeholder>(`Goals/${goalId}/GStakeholders/${uid}`)

  }

  public async getStakeholder(uid: string, goalId: string): Promise<IGoalStakeholder | undefined> {
    const stakeholder: IGoalStakeholder = await this.getStakeholderDocObs(uid, goalId).pipe(take(1)).toPromise()
    if (stakeholder.username !== undefined) {
      return stakeholder
    } else return undefined
  }

  public getGoals(uid: string, role: enumGoalStakeholder, publicOnly: boolean, activeOnly?: boolean): Observable<IGoal[]> {

    let stakeholder$: Observable<IGoalStakeholder[]>

      // TODO add goals where current user has access to the goal (private + collectiveGoalOnly) OR to the collective goal (public to collectiveGoalOnly) 
    if (!publicOnly && !activeOnly) stakeholder$ = this.db.collectionGroupWithIds$<IGoalStakeholder[]>(`GStakeholders`, ref => ref.where('uid', '==', uid).where(role, '==', true).orderBy('createdAt', 'desc'))
    if (!publicOnly && activeOnly !== undefined) stakeholder$ = this.db.collectionGroupWithIds$<IGoalStakeholder[]>(`GStakeholders`, ref => ref.where('uid', '==', uid).where(role, '==', true).where('goalIsFinished', '==', !activeOnly).orderBy('createdAt', 'desc'))
    if (publicOnly && !activeOnly) stakeholder$ = this.db.collectionGroupWithIds$<IGoalStakeholder[]>(`GStakeholders`, ref => ref.where('uid', '==', uid).where('goalPublicity', '==', enumGoalPublicity.public).where(role, '==', true).orderBy('createdAt', 'desc'))
    if (publicOnly && activeOnly !== undefined) stakeholder$ = this.db.collectionGroupWithIds$<IGoalStakeholder[]>(`GStakeholders`, ref => ref.where('uid', '==', uid).where('goalPublicity', '==', enumGoalPublicity.public).where(role, '==', true).where('goalIsFinished', '==', !activeOnly).orderBy('createdAt', 'desc'))

    return stakeholder$.pipe(
      switchMap(stakeholders => {
        const goalIDs = stakeholders.map(stakeholder => stakeholder.goalId)
        const goalDocs = goalIDs.map(id => this.db.docWithId$<IGoal>(`Goals/${id}`))

        return goalDocs.length ? combineLatest<IGoal[]>(goalDocs) : of([])

      })
    )

  }

  public async upsert(uid: string, goalId: string, roles: roleArgs){

    // note: syncing collectiveGoalStakeholder.isAchiever is done by firebase function (goal-stakeholder.ts)
    
    //Set stakeholder reference
    this.stakeholderDocRef = this.afs.collection('Goals')
                                         .doc(goalId)
                                         .collection('GStakeholders')
                                         .doc<IGoalStakeholder>(uid)

    //Check whether the stakeholder exists
    this.stakeholderDocRef.snapshotChanges().pipe(take(1)).toPromise().then(snap => {
      if (snap.payload.exists === false) {
        //Stakeholder does not exist -> create new
        this.createNewStakeholder(uid, goalId, roles)
      } else {
        //Stakeholder already exists -> set role to roleStatus and update
        this.db.update(this.stakeholderDocRef, roles)
      }
    })
  }

  public async delete(goalId: string): Promise<void> {

    await this.db.doc(`Goals/${goalId}`).delete()

  }

  private async createNewStakeholder(uid: string, goalId: string, roles: roleArgs): Promise<void> {

    let newStakeholder = <IGoalStakeholder>{}

    const userProfile = await this.db.docWithId$<IProfile>(`Users/${uid}/Profile/${uid}`).pipe(first()).toPromise()
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