import { Injectable } from '@angular/core';
import { DocumentSnapshot, Firestore } from '@angular/fire/firestore';
// Rxjs
import { Observable } from 'rxjs';
// Services
import { FireCollection } from '@strive/utils/services/collection.service';
// Interfaces
import { DailyGratefulness } from '@strive/model'
import { toDate } from '@strive/utils/helpers'

@Injectable({
  providedIn: 'root'
})
export class DailyGratefulnessService extends FireCollection<DailyGratefulness> {
  readonly path = 'Users/:uid/Exercises'

  constructor(db: Firestore) {
    super(db)
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<DailyGratefulness>): DailyGratefulness | undefined {
    if (!snapshot.exists()) return
    return toDate<DailyGratefulness>({ ...snapshot.data(), id: snapshot.id })
  }

  getSettings$(uid: string): Observable<DailyGratefulness | undefined> {
    return this.valueChanges('DailyGratefulness', { uid })
  }

  getDailyGratefulnessSettings(uid: string): Promise<DailyGratefulness | undefined> {
    return this.getValue('DailyGratefulness', { uid })
  }

  save(uid: string, dailyGratefulnessSettings: Partial<DailyGratefulness>) {
    return this.upsert({ ...dailyGratefulnessSettings, id: 'DailyGratefulness' }, { params: { uid }})
  }
}
