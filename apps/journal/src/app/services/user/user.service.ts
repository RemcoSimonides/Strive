import { Injectable } from '@angular/core';
// Services
import { FirestoreService } from '../firestore/firestore.service';
import { AuthService } from '../auth/auth.service';
// Interface
import { IUser } from '@strive/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private authService: AuthService,
    private db: FirestoreService,
  ) { }

  async createUser(email: string) {

    const newUser = <IUser>{
      email: email,
      walletBalance: 0
    }

    const uid = (await this.authService.afAuth.currentUser).uid

    //Create user
    await this.db.upsert(`Users/${uid}`, newUser)

  }

}
