import { Injectable } from '@angular/core';
// Rxjs
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
// Services
import { FirestoreService } from '../firestore/firestore.service';
import { AuthService } from '../auth/auth.service';
// Interfaces
import { IProfile } from '@strive/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private authService: AuthService,
    private db: FirestoreService
  ) { }

  public getProfileDocObs(uid: string): Observable<IProfile> {

    return this.db.docWithId$<IProfile>(`Users/${uid}/Profile/${uid}`)

  }

  public async getProfile(uid: string): Promise<IProfile> {

    return await this.getProfileDocObs(uid).pipe(first()).toPromise()

  }

  public async upsert(profile: Partial<IProfile>) {

    const currentUser = await this.authService.afAuth.currentUser

    // Create Profile
    await this.db.upsert(`Users/${currentUser.uid}/Profile/${currentUser.uid}`, profile);

    // Update afAuth profile
    currentUser.updateProfile({
      displayName: profile.username || currentUser.displayName,
      photoURL: profile.image || currentUser.photoURL
    })

  }

  public async addFCMToken(token: string): Promise<void> {

    const uid = (await this.authService.afAuth.currentUser).uid

    await this.db.upsert<IProfile>(`Users/${uid}/Profile/${uid}`, {
      fcmTokens: this.db.getArrayUnion(token)
    })

  }

}
