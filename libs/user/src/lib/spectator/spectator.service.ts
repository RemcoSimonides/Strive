import { Injectable } from '@angular/core'
import { DocumentSnapshot, serverTimestamp, where, WriteBatch } from 'firebase/firestore'
import { FireSubCollection, WriteOptions } from 'ngfire'

import { Spectator, createSpectator } from '@strive/model'

import { ProfileService } from '../user/profile.service'
import { AuthService } from '../auth/auth.service'

@Injectable({
  providedIn: 'root'
})
export class UserSpectateService extends FireSubCollection<Spectator> {
  readonly path = `Users/:uid/Spectators`
  override readonly idKey = 'uid'
  override readonly memorize = true

  constructor(
    private auth: AuthService,
    private profile: ProfileService
  ) {
    super()
  }

  protected override toFirestore(spectator: Spectator, actionType: 'add' | 'update'): Spectator {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') spectator.createdAt = timestamp
    spectator.updatedAt = timestamp
    
    return spectator
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
      this.profile.getValue(uid),
      this.profile.getValue(params['uid'])
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
    if (!this.auth.uid) throw new Error('')
    return this.getSpectator(this.auth.uid, uidToBeSpectated)
  }

  getSpectator(uidSpectator: string, uidToBeSpectated: string) {
    return this.load(uidSpectator, { uid: uidToBeSpectated })
  }

  getSpectators(uid: string) {
    return this.load([where('isSpectator', '==', true)], { uid })
  }

  getSpectating(uid: string) {
    return this.load([where('uid', '==', uid)])
  }

  /**
   * @param uid the uid of the user that is going to be spectated
   */
  toggleSpectate(uid: string, spectate: boolean) {
    this.upsert({ uid: this.auth.uid, isSpectator: spectate }, { params: { uid }})
  }

}
