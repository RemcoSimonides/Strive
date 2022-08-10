import { Injectable } from '@angular/core';
import { DocumentSnapshot, getFirestore, where, WriteBatch } from 'firebase/firestore';
// Services
import { UserService } from '@strive/user/user/user.service';
// Interfaces
import { Spectator, createSpectator } from '@strive/model';
import { FireCollection, WriteOptions } from '@strive/utils/services/collection.service';

@Injectable({
  providedIn: 'root'
})
export class UserSpectateService extends FireCollection<Spectator> {
  readonly path = `Users/:uid/Spectators`
  override readonly idKey = 'uid'

  constructor(private user: UserService) {
    super(getFirestore())
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Spectator>) {
    return snapshot.exists()
      ? createSpectator({ ...snapshot.data(), uid: snapshot.id })
      : undefined
  }

  override async onCreate(spectator: Spectator, { write, params }: WriteOptions) {
    const uid = spectator.uid
    if (!params?.['uid']) throw new Error('uid not provided')
    const [current, toBeSpectated] = await Promise.all([
      this.user.getValue(uid),
      this.user.getValue(params['uid'])
    ])

    if (!current) throw new Error(`Couldn't find current user data`)
    if (!toBeSpectated) throw new Error(`Couldn't find data of user to be spectated`)

    const ref = this.getRef(uid, { uid: params['uid'] });
    const data = createSpectator({
      uid,
      username: current.username,
      photoURL: current.photoURL,
      isSpectator: true,
      profileId: toBeSpectated.uid,
      profileUsername: toBeSpectated.username,
      profilePhotoURL: toBeSpectated.photoURL
    });
    (write as WriteBatch).update(ref, { ...data })
  }

  getCurrentSpectator(uidToBeSpectated: string) {
    if (!this.user.uid) throw new Error('')
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
