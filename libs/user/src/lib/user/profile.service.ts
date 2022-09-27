import { Injectable } from '@angular/core'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { toDate, FireCollection } from 'ngfire'

import { createUser, User } from '@strive/model'

@Injectable({ providedIn: 'root' })
export class ProfileService extends FireCollection<User> {
  protected override readonly path = 'Users'
  protected override readonly idKey = 'uid'
  protected override readonly memorize = true

  protected override toFirestore(profile: Partial<User>, actionType: 'add' | 'update'): Partial<User> {
    const timestamp = serverTimestamp() as any
  
    if (actionType === 'add') profile.createdAt = timestamp
    profile.updatedAt = timestamp

    return profile
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<User>) {
    return snapshot.exists()
      ? createUser(toDate({ ...snapshot.data(), uid: snapshot.id }))
      : undefined
  }
}
