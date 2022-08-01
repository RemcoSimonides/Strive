import { Injectable } from '@angular/core';
// Interfaces
import { FireCollection } from '@strive/utils/services/collection.service';
import { Firestore, DocumentSnapshot } from '@angular/fire/firestore';
import { createGoalEvent, GoalEvent } from '@strive/model'
import { toDate } from '@strive/utils/helpers';

@Injectable({
  providedIn: 'root'
})
export class GoalEventService extends FireCollection<GoalEvent> {
  readonly path = `GoalEvents`
  
  constructor(db: Firestore) { 
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<GoalEvent>) {
    return snapshot.exists()
      ? createGoalEvent(toDate({ ...snapshot.data(), id: snapshot.id, path: snapshot.ref.path }))
      : undefined
  }

}
