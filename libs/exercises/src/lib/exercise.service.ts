import { Injectable, inject } from '@angular/core'
import { Affirmations, DailyGratitude, DearFutureSelf, SelfReflectSettings, WheelOfLifeSettings } from '@strive/model'
import { collectionData as _collectionData, collection, Firestore } from '@angular/fire/firestore'
import { toDate } from '@strive/utils/firebase'
import { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from '@angular/fire/firestore'
import { Observable } from 'rxjs'

export type ExerciseSettings = Affirmations | DailyGratitude | WheelOfLifeSettings | DearFutureSelf | SelfReflectSettings

const converter: FirestoreDataConverter<ExerciseSettings> = {
  toFirestore: () => {
    throw new Error('Dont write to firestore using this service. Use dedicated service for each exercise instead')
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    return toDate({ ...snapshot.data(options), id: snapshot.id }) as ExerciseSettings
  }
}

@Injectable({providedIn: 'root'})
export class ExerciseService {
  private firestore = inject(Firestore)

  collectionData(options: { uid: string }): Observable<ExerciseSettings[]> {
    const colRef = collection(this.firestore, `Users/${options.uid}/Exercises`).withConverter(converter)
    return _collectionData(colRef, { idField: 'id' })
  }
}
