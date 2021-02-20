import { Injectable } from '@angular/core';
// Rxjs
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
// Services
import { FirestoreService } from '@strive/utils/services/firestore.service';
// Interfaces
import { DailyGratefulness } from '@strive/exercises/daily-gratefulness/+state/daily-gratefulness.firestore'

@Injectable({
  providedIn: 'root'
})
export class DailyGratefulnessService {

  constructor(
    private db: FirestoreService
  ) { }

  public getDailyGratefulnessSettings$(uid: string): Observable<DailyGratefulness> {
    return this.db.docWithId$<DailyGratefulness>(`Users/${uid}/Exercises/DailyGratefulness`)
  }

  public async getDailyGratefulnessSettings(uid: string): Promise<DailyGratefulness> {
    return await this.getDailyGratefulnessSettings$(uid).pipe(first()).toPromise()
  }

  async save(uid: string, dailyGratefulnessSettings: Partial<DailyGratefulness>) {
    await this.db.upsert(`Users/${uid}/Exercises/DailyGratefulness`, dailyGratefulnessSettings)
  }
}
