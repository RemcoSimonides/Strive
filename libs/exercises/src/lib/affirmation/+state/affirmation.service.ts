import { Injectable } from '@angular/core';

// Rxjs
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

// Strive
import { FirestoreService } from '@strive/utils/services/firestore.service';
import { Affirmations } from './affirmation.firestore';

@Injectable({providedIn: 'root'})
export class AffirmationService {

  constructor(private db: FirestoreService) { }

  public getAffirmations$(uid: string): Observable<Affirmations> {
    return this.db.docWithId$<Affirmations>(`Users/${uid}/Exercises/Affirmations`)
  }

  async getAffirmations(uid: string): Promise<Affirmations> {
    return await this.getAffirmations$(uid).pipe(first()).toPromise()
  }

  async saveAffirmations(uid: string, affirmations: Affirmations): Promise<void> {
    await this.db.upsert(`Users/${uid}/Exercises/Affirmations`, affirmations)
  }
}