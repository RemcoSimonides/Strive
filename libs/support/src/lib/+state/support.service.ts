import { Injectable } from '@angular/core';
import { DocumentSnapshot, Firestore } from '@angular/fire/firestore';
// Services
import { FireCollection } from '@strive/utils/services/collection.service';
// Interfaces
import { createSupport } from '@strive/support/+state/support.firestore';
import { Support } from '@strive/support/+state/support.firestore';

@Injectable({ providedIn: 'root' })
export class SupportService extends FireCollection<Support> {
  readonly path = 'Goals/:goalId/Supports'

  constructor(protected db: Firestore) {
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Support>) {
    return (snapshot.exists())
      ? createSupport({ ...snapshot.data(), id: snapshot.id })
      : undefined
  }
}
