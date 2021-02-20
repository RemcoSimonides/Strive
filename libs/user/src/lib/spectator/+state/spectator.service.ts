import { Injectable } from '@angular/core';
// Rxjs
import { first, take } from 'rxjs/operators';
// Angularfire
import { AngularFirestore } from '@angular/fire/firestore';
// Services
import { FirestoreService } from '@strive/utils/services/firestore.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import { Spectator, createSpectator } from './spectator.firestore';

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

  async getSpectator(uidSpectator: string, uidToBeSpectated: string) {
    return await this.db.docWithId$<Spectator>(`Users/${uidToBeSpectated}/Spectators/${uidSpectator}`).pipe(first()).toPromise()
  }

  async getSpectators(uid: String): Promise<Spectator[]> {
    return this.db.colWithIds$<Spectator[]>(`Users/${uid}/Spectators`, ref => ref.where('isSpectator', '==', true)).pipe(take(1)).toPromise()
  }

  async getSpectating(uid: string): Promise<Spectator[]> {
    return this.db.collectionGroupWithIds$<Spectator[]>(`Spectators`, ref => ref.where('uid', '==', uid)).pipe(take(1)).toPromise()
  }

  /**
   * 
   * @param targetUID the uid of the user that is going to be spectated
   */
  toggleSpectate(targetUID: string) {
    this.afs.doc<Spectator>(`Users/${targetUID}/Spectators/${this.user.uid}`)
      .snapshotChanges()
      .pipe(take(1))
      .toPromise()
      .then(async spectatorSnap => {

        if (spectatorSnap.payload.exists) {

          const spectator: Spectator = spectatorSnap.payload.data()

          await this.upsert(targetUID, {
            isSpectator: !spectator.isSpectator
          })

        } else {
          await this.create(targetUID)
        }
      })

  }

  /**
   * 
   * @param uid uid of the user which is going to be spectated
   */
  private async create(uid: string) {
    const [current, toBeSpectated] = await Promise.all([this.user.getProfile(), this.user.getProfile(uid)])

    const spectator = createSpectator({
      uid: current.id,
      username: current.username,
      photoURL: current.photoURL,
      isSpectator: true,
      profileId: toBeSpectated.id,
      profileUsername: toBeSpectated.username,
      profilePhotoURL: toBeSpectated.photoURL
    })

    await this.upsert(uid, spectator)
  }

  private upsert(targetUID: string, spectator: Partial<Spectator>) {
    return this.db.upsert(`Users/${targetUID}/Spectators/${this.user.uid}`, spectator)
  }
}
