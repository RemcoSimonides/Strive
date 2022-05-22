import { Injectable } from '@angular/core';
import { DocumentSnapshot, Firestore } from '@angular/fire/firestore';
// Rxjs
import { Observable } from 'rxjs';
// Services
import { FireCollection } from '@strive/utils/services/collection.service';
// Interfaces
import { DailyGratefulness } from '@strive/exercises/daily-gratefulness/+state/daily-gratefulness.firestore'

@Injectable({
  providedIn: 'root'
})
export class DailyGratefulnessService extends FireCollection<DailyGratefulness> {
  readonly path = 'Users/:uid/Exercises'

  constructor(db: Firestore) {
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<DailyGratefulness>): DailyGratefulness {
    if (!snapshot.exists()) return
    const setting = { ...snapshot.data(), id: snapshot.id }
    setting.time = (setting.time as any).toDate()
    return setting
  }

  getSettings$(uid: string): Observable<DailyGratefulness> {
    return this.valueChanges('DailyGratefulness', { uid })
  }

  getDailyGratefulnessSettings(uid: string): Promise<DailyGratefulness> {
    return this.getValue('DailyGratefulness', { uid })
  }

  save(uid: string, dailyGratefulnessSettings: Partial<DailyGratefulness>) {
    return this.upsert({ ...dailyGratefulnessSettings, id: 'DailyGratefulness' }, { params: { uid }})
  }
}
