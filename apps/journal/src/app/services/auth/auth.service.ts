//Angular
import { Injectable } from '@angular/core';
//Angularfire2
import { AngularFireAuth } from '@angular/fire/auth';
//Rxjs
import { Observable, of } from 'rxjs';
import { switchMap, first } from 'rxjs/operators';
//Services
import { FirestoreService } from '../../services/firestore/firestore.service';
//Interfaces
import { 
  IProfile,
  IUser
} from '@strive/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<IUser>
  userProfile$: Observable<IProfile>

  constructor(
    public afAuth: AngularFireAuth,
    db: FirestoreService,
  ) {

    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => (user ? db.docWithId$(`Users/${user.uid}`) : of(null)))
    )

    this.userProfile$ = this.afAuth.authState.pipe(
      switchMap(user => (user ? db.docWithId$(`Users/${user.uid}/Profile/${user.uid}`) : of(null)))
    )

  }

  /**
   * Check who's logged in at this moment
   */
  public async getCurrentUser(): Promise<IUser> {
    return this.user$.pipe(
      first()
    ).toPromise()
  }

  /**
   * Check who's logged in at this moment
   */
  public async getCurrentUserProfile(): Promise<IProfile> {
    return this.userProfile$.pipe(
      first()
    ).toPromise()
  }

  public getCurrentuserProfileObs(): Observable<IProfile> {
    return this.userProfile$
  }

  /**
   * Check whether user is still logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return !!user
  }

  async anonymousLogin() {
    const credential = await this.afAuth.signInAnonymously()
    return await this.updateUserData(credential.user)
  }

  async signOut() {
    await this.afAuth.signOut()
  }

  private updateUserData({ uid, email, displayName, photoURL, isAnonymous }) {
    const path = `Users/${uid}`
  
    const data = {
      uid,
      email,
      displayName,
      photoURL,
      isAnonymous
    }

    console.log('update user data has been turned off')
    // return this.db.updateAt(path, data)
  
  }

  async signInWithEmailAndPassword(email: string, password: string):  Promise<void> {
    await this.afAuth.signInWithEmailAndPassword(email, password)
  }

}
