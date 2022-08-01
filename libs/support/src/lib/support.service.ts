import { Injectable } from '@angular/core'
import { DocumentSnapshot, Firestore } from '@angular/fire/firestore'
// Services
import { FireCollection } from '@strive/utils/services/collection.service'
// Interfaces
import { createSupport, Support } from '@strive/model'

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
