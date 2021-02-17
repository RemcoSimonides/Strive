import { Injectable } from '@angular/core';

// Rxjs
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

// Strive
import { FirestoreService } from '@strive/utils/services/firestore.service';
import { BucketList } from './bucket-list.firestore';

@Injectable({providedIn: 'root'})
export class BucketListService {

  constructor(private db: FirestoreService) { }

  public getBucketList$(uid: string): Observable<BucketList> {
    return this.db.docWithId$<BucketList>(`Users/${uid}/Exercises/BucketList`)
  }

  async getBucketList(uid: string): Promise<BucketList> {
    return await this.getBucketList$(uid).pipe(first()).toPromise()
  }

  async saveBucketList(uid: string, bucketList: BucketList): Promise<void> {
    await this.db.upsert(`Users/${uid}/Exercises/BucketList`, bucketList)
  } 
}