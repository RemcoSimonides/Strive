import { Injectable } from '@angular/core';
// Rxjs
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
// Services
import { FirestoreService } from '../firestore/firestore.service';
// Interfaces
import { IAffirmations, IBucketList, IDailyGratefulness } from 'apps/journal/src/app/interfaces/exercises.interface';

@Injectable({
  providedIn: 'root'
})
export class ExercisesService {

  constructor(
    private db: FirestoreService
  ) { }

  public getAffirmationsDocObs(uid: string): Observable<IAffirmations> {

    return this.db.docWithId$<IAffirmations>(`Users/${uid}/Exercises/Affirmations`)

  }

  async getAffirmations(uid: string): Promise<IAffirmations> {

    return await this.getAffirmationsDocObs(uid).pipe(first()).toPromise()

  }

  async saveAffirmations(uid: string, affirmations: IAffirmations): Promise<void> {

    await this.db.upsert(`Users/${uid}/Exercises/Affirmations`, affirmations)

  }

  public getBucketListDocObs(uid: string): Observable<IBucketList> {

    return this.db.docWithId$<IBucketList>(`Users/${uid}/Exercises/BucketList`)

  }

  async getBucketList(uid: string): Promise<IBucketList> {

    return await this.getBucketListDocObs(uid).pipe(first()).toPromise()

  }

  async saveBucketList(uid: string, bucketList: IBucketList): Promise<void> {

    await this.db.upsert(`Users/${uid}/Exercises/BucketList`, bucketList)

  }

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
