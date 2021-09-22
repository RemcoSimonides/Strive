import { Injectable } from '@angular/core';
import { Auth, updateProfile, user } from '@angular/fire/auth';
import { FireCollection } from '@strive/utils/services/collection.service';
// Interfaces
import { Profile } from './user.firestore';
import { DocumentSnapshot, Firestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProfileService extends FireCollection<Profile> {
  readonly path = 'Users/:uid/Profile'
  readonly idKey = 'uid'

  constructor(db: Firestore, private auth: Auth) {
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Profile>) {
    return snapshot.exists()
      ? { ...snapshot.data(), uid: snapshot.id, path: snapshot.ref.path }
      : undefined
  }

  async onUpdate(profile: Profile) {
    const _user = await user(this.auth).pipe(take(1)).toPromise()
    if (_user && (profile.username || profile.photoURL)) {
      updateProfile(_user, {
        displayName: profile.username ?? _user.displayName,
        photoURL: profile.photoURL ?? _user.photoURL
      })
    }
  }
}
