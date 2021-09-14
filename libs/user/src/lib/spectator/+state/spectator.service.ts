import { Injectable } from '@angular/core';
// Angularfire
import { Firestore, DocumentSnapshot, where, WriteBatch } from '@angular/fire/firestore';
// Services
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import { Spectator, createSpectator } from './spectator.firestore';
import { FireCollection, WriteOptions } from '@strive/utils/services/collection.service';
import { ProfileService } from '@strive/user/user/+state/profile.service';

@Injectable({
  providedIn: 'root'
})
export class UserSpectateService extends FireCollection<Spectator> {
  readonly path = `Users/:uid/Spectators`
  readonly idKey = 'uid'

  constructor(
    db: Firestore,
    private user: UserService,
    private profile: ProfileService
  ) {
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Spectator>) {
    return snapshot.exists
      ? createSpectator({ ...snapshot.data(), uid: snapshot.id })
      : undefined
  }

  async onCreate(spectator: Spectator, { write, params }: WriteOptions) {
    const uid = spectator.uid
    const [current, toBeSpectated] = await Promise.all([
      this.profile.getValue(uid, { uid }),
      this.profile.getValue(params.uid, { uid: params.uid })
    ])

    const ref = this.getRef(uid, { uid: params.uid });
    const data = createSpectator({
      uid,
      username: current.username,
      photoURL: current.photoURL,
      isSpectator: true,
      profileId: toBeSpectated.id,
      profileUsername: toBeSpectated.username,
      profilePhotoURL: toBeSpectated.photoURL
    });
    (write as WriteBatch).update(ref, { ...data })
  }

  getCurrentSpectator(uidToBeSpectated: string) {
    return this.getSpectator(this.user.uid, uidToBeSpectated)
  }

  getSpectator(uidSpectator: string, uidToBeSpectated: string) {
    return this.getValue(uidSpectator, { uid: uidToBeSpectated })
  }

  getSpectators(uid: string) {
    return this.getValue([where('isSpectator', '==', true)], { uid })
  }

  getSpectating(uid: string) {
    return this.getGroup([where('uid', '==', uid)])
  }

  /**
   * @param uid the uid of the user that is going to be spectated
   */
  toggleSpectate(uid: string, spectate: boolean) {
    this.upsert({ uid: this.user.uid, isSpectator: spectate }, { params: { uid }})
  }

}
