import { Injectable } from '@angular/core';
// Rxjs
import { first, take } from 'rxjs/operators';
// Angularfire
import { AngularFirestore } from '@angular/fire/firestore';
// Services
import { FirestoreService } from '@strive/utils/services/firestore.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import { ISpectator } from '@strive/interfaces';
import { Profile } from '@strive/user/user/+state/user.firestore';

@Injectable({
  providedIn: 'root'
})
export class UserSpectateService {

  constructor(
    private afs: AngularFirestore,
    private db: FirestoreService,
    private user: UserService
  ) { }

  getCurrentSpectator(uidToBeSpectated: string) {
    return this.getSpectator(this.user.uid, uidToBeSpectated)
  }

  getSpectator(uidSpectator: string, uidToBeSpectated) {
    return this.db.docWithId$<ISpectator>(`Users/${uidToBeSpectated}/Spectators/${uidSpectator}`).pipe(first()).toPromise()
  }

  async getSpectators(uid: String): Promise<ISpectator[]> {
    return this.db.colWithIds$<ISpectator[]>(`Users/${uid}/Spectators`, ref => ref.where('isSpectator', '==', true)).pipe(take(1)).toPromise()
  }

  async getSpectating(uid: string): Promise<ISpectator[]> {
    return this.db.collectionGroupWithIds$<ISpectator[]>(`Spectators`, ref => ref.where('uid', '==', uid)).pipe(take(1)).toPromise()
  }

  /**
   * 
   * @param targetUID the uid of the user that is going to be spectated
   */
  async toggleSpectate(targetUID: string): Promise<void> {

    this.afs.doc<ISpectator>(`Users/${targetUID}/Spectators/${this.user.uid}`)
      .snapshotChanges()
      .pipe(take(1))
      .toPromise()
      .then(async spectatorSnap => {

        if (spectatorSnap.payload.exists) {

          const spectator: ISpectator = spectatorSnap.payload.data()

          await this.upsert(targetUID, {
            isSpectator: !spectator.isSpectator
          })

        } else {
          await this.createSpectator(targetUID)
        }
      })

  }

  /**
   * 
   * @param uid uid of the user which is going to be spectated
   */
  private async createSpectator(uid: string): Promise<void> {

    const currentUserProfile: Profile = await this.user.getProfile()
    const toBeSpectatedUserProfile: Profile = await this.user.getProfile(uid)

    const newSpectator = <ISpectator>{}
    newSpectator.uid = currentUserProfile.id
    newSpectator.username = currentUserProfile.username
    newSpectator.photoURL = currentUserProfile.photoURL
    newSpectator.isSpectator = true
    newSpectator.profileId = toBeSpectatedUserProfile.id
    newSpectator.profileUsername = toBeSpectatedUserProfile.username
    newSpectator.profilePhotoURL = toBeSpectatedUserProfile.photoURL
    
    await this.upsert(uid, newSpectator)

  }

  private upsert(targetUID: string, spectator: Partial<ISpectator>) {
    return this.db.upsert(`Users/${targetUID}/Spectators/${this.user.uid}`, spectator)
  }

}
