import { Injectable } from '@angular/core'
import { DocumentSnapshot, serverTimestamp, where } from 'firebase/firestore'
import { FireSubCollection } from 'ngfire'
import { map } from 'rxjs'

import { Spectator, createSpectator } from '@strive/model'

import { AuthService } from '@strive/auth/auth.service'

@Injectable({
  providedIn: 'root'
})
export class SpectatorService extends FireSubCollection<Spectator> {
  readonly path = `Users/:uid/Spectators`
  override readonly idKey = 'uid'
  override readonly memorize = true

  constructor(private auth: AuthService) {
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

  getSpectators$(uid: string) {
    return this.valueChanges([where('isSpectator', '==', true)], { uid })
  }

  getSpectating(uid: string) {
    return this.load([where('uid', '==', uid)]).then(
      spectators => spectators.filter(spectator => spectator.isSpectator)
    )
  }

  getSpectating$(uid: string) {
    return this.valueChanges([where('uid', '==', uid)]).pipe(
      map(spectators => spectators.filter(spectator => spectator.isSpectator))
    )
  }

}
