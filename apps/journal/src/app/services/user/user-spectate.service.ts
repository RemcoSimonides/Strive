import { Injectable } from '@angular/core';
// Rxjs
import { first, take } from 'rxjs/operators';
// Angularfire
import { AngularFirestore } from '@angular/fire/firestore';
// Services
import { FirestoreService } from '../firestore/firestore.service';
import { ProfileService } from '../profile/profile.service';
import { AuthService } from '../auth/auth.service';
// Interfaces
import {
  ISpectator,
  IProfile
} from '@strive/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserSpectateService {

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private db: FirestoreService,
    private profileService: ProfileService,
  ) { }

  async getCurrentSpectator(uidToBeSpectated: string): Promise<ISpectator> {

    const { uid } = await this.authService.afAuth.currentUser
    return await this.getSpectator(uid, uidToBeSpectated)

  }

  async getSpectator(uidSpectator: string, uidToBeSpectated): Promise<ISpectator> {

    return await this.db.docWithId$<ISpectator>(`Users/${uidToBeSpectated}/Spectators/${uidSpectator}`).pipe(first()).toPromise()

  }

  async getSpectators(uid: String): Promise<ISpectator[]> {

    return this.db.colWithIds$(`Users/${uid}/Spectators`, ref => ref.where('isSpectator', '==', true)).pipe(take(1)).toPromise()

  }

  async getSpectating(uid: string): Promise<ISpectator[]> {

    return this.db.collectionGroupWithIds$(`Spectators`, ref => ref.where('uid', '==', uid)).pipe(take(1)).toPromise()

  }

  /**
   * 
   * @param targetUID the uid of the user that is going to be spectated
   */
  async toggleSpectate(targetUID: string): Promise<void> {

    const { uid } = await this.authService.afAuth.currentUser

    this.afs.doc<ISpectator>(`Users/${targetUID}/Spectators/${uid}`)
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

    const currentUserProfile: IProfile = await this.authService.getCurrentUserProfile()
    const toBeSpectatedUserProfile: IProfile = await this.profileService.getProfile(uid)
    console.log('current user', currentUserProfile)

    const newSpectator = <ISpectator>{}
    newSpectator.uid = currentUserProfile.id
    newSpectator.username = currentUserProfile.username
    newSpectator.photoURL = currentUserProfile.image
    newSpectator.isSpectator = true
    newSpectator.profileId = toBeSpectatedUserProfile.id
    newSpectator.profileUsername = toBeSpectatedUserProfile.username
    newSpectator.profilePhotoURL = toBeSpectatedUserProfile.image
    
    await this.upsert(uid, newSpectator)

  }

  private async upsert(targetUID: string, spectator: Partial<ISpectator>): Promise<void> {

    const { uid } = await this.authService.afAuth.currentUser
    await this.db.upsert(`Users/${targetUID}/Spectators/${uid}`, spectator)
    
  }

}
