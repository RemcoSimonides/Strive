import { Injectable } from '@angular/core';
// Rxjs
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
// Services
import { FirestoreService } from '@strive/utils/services/firestore.service';
// Interfaces
import { IDailyGratefulness } from '@strive/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ExercisesService {

  constructor(
    private db: FirestoreService
  ) { }

  public getDailyGratefulnessSettingsDocObs(uid: string): Observable<IDailyGratefulness> {

    return this.db.docWithId$<IDailyGratefulness>(`Users/${uid}/Exercises/DailyGratefulness`)

  }

  public async getDailyGratefulnessSettings(uid: string): Promise<IDailyGratefulness> {

    return await this.getDailyGratefulnessSettingsDocObs(uid).pipe(first()).toPromise()

  }

  async saveDailyGratefulnessSettings(uid: string, dailyGratefulnessSettings: IDailyGratefulness): Promise<void> {

    await  this.db.upsert(`Users/${uid}/Exercises/DailyGratefulness`, dailyGratefulnessSettings)

  }
}
