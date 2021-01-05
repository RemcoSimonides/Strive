import { Injectable } from '@angular/core';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
// Rxjs
import { Observable, combineLatest, of } from 'rxjs';
import { take, switchMap, first } from 'rxjs/operators';
// Services
import { FirestoreService } from '@strive/utils/services/firestore.service';
// Interfaces
import { CollectiveGoalStakeholder } from './stakeholder.firestore';
import { ICollectiveGoal } from '../../collective-goal/+state/collective-goal.firestore';
import { Profile } from '@strive/user/user/+state/user.firestore';

@Injectable({ providedIn: 'root' })
export class CollectiveGoalStakeholderService {

  collectiveGoalStakeholderDocRef: AngularFirestoreDocument<CollectiveGoalStakeholder>
  collectiveGoalStakeholderDocObs: Observable<CollectiveGoalStakeholder>

  constructor(
    private afs: AngularFirestore,
    private db: FirestoreService
  ) { }

  public getStakeholderDocObs(uid: string, collectiveGoalId: string): Observable<CollectiveGoalStakeholder> {

    return this.db.docWithId$<CollectiveGoalStakeholder>(`CollectiveGoals/${collectiveGoalId}/CGStakeholders/${uid}`)

  }

  public async getStakeholder(uid: string, collectiveGoalId: string): Promise<CollectiveGoalStakeholder | undefined> {
    const stakeholder: CollectiveGoalStakeholder = await this.getStakeholderDocObs(uid, collectiveGoalId).pipe(take(1)).toPromise()
    if  (stakeholder.username) {
      return stakeholder
    } else return undefined
  }  

  /**
   * Either creates a new stakeholder if the stakeholder does not exist, or updates an existing stakeholder to the specified role
   * @param uid users' id
   * @param collectiveGoalId 
   * @param role which role should be set to roleStatus
   * @param roleStatus to which value the role needs to be set
   */
  public async upsert(uid: string,  collectiveGoalId: string, roles: roleArgs): Promise<void> {

    //Set stakeholder reference
    this.collectiveGoalStakeholderDocRef = this.afs.collection('CollectiveGoals')
                                                  .doc(collectiveGoalId)
                                                  .collection('CGStakeholders')
                                                  .doc<CollectiveGoalStakeholder>(uid)

    //Check whether stakeholder exists
    this.collectiveGoalStakeholderDocRef.snapshotChanges().pipe(take(1)).toPromise().then(snap => {
      if (snap.payload.exists === false){
        //Stakeholder does not yet exist -> create new
        this.createNewStakeholder(uid, collectiveGoalId, roles)
      } else {
        //Stakeholder already exists -> set role to roleStatus and update
        this.db.update(this.collectiveGoalStakeholderDocRef, roles)
      }
    })

  }

  public getCollectiveGoals(uid: string, isPublic?: boolean): Observable<ICollectiveGoal[]> {

    let stakeholdersColObs: Observable<CollectiveGoalStakeholder[]>

    if (isPublic !== undefined) {
      stakeholdersColObs = this.db.collectionGroupWithIds$<CollectiveGoalStakeholder[]>(`CGStakeholders`, ref => ref.where('uid', '==', uid).where('collectiveGoalIsPublic', '==', isPublic).orderBy('createdAt', 'desc'))
    } else {
      stakeholdersColObs = this.db.collectionGroupWithIds$<CollectiveGoalStakeholder[]>(`CGStakeholders`, ref => ref.where('uid', '==', uid).orderBy('createdAt', 'desc'))
    }

    return stakeholdersColObs.pipe(
      switchMap(stakeholders => {

        const collectiveGoalIDs = stakeholders.map(stakeholder => stakeholder.collectiveGoalId)
        const collectiveGoalDocs = collectiveGoalIDs.map(id => this.db.docWithId$<ICollectiveGoal>(`CollectiveGoals/${id}`))

        return collectiveGoalDocs.length ? combineLatest<ICollectiveGoal[]>(collectiveGoalDocs) : of([])

      })
    )

  }

  private async createNewStakeholder(uid: string, collectiveGoalId: string, roles: roleArgs): Promise<void> {
    let newStakeholder = <CollectiveGoalStakeholder>{}

    const userProfile = await this.db.docWithId$<Profile>(`Users/${uid}/Profile/${uid}`).pipe(first()).toPromise()
    newStakeholder.uid = uid
    newStakeholder.username = userProfile.username
    newStakeholder.photoURL = userProfile.image
    newStakeholder.isAdmin = roles.isAdmin ? roles.isAdmin : false
    newStakeholder.isAchiever = roles.isAchiever ? roles.isAchiever : false
    newStakeholder.isSpectator = roles.isSpectator ? roles.isSpectator : false

    const collectiveGoal = await this.db.docWithId$<ICollectiveGoal>(`CollectiveGoals/${collectiveGoalId}`).pipe(first()).toPromise()
    newStakeholder.collectiveGoalId = collectiveGoalId
    newStakeholder.collectiveGoalTitle = collectiveGoal.title
    newStakeholder.collectiveGoalIsPublic = collectiveGoal.isPublic

    await this.db.set(`CollectiveGoals/${collectiveGoalId}/CGStakeholders/${uid}`, newStakeholder)
  }

}

export interface roleArgs {
  isAdmin?: boolean
  isAchiever?: boolean
  isSpectator?: boolean
}