import { Injectable, Injector, inject } from '@angular/core'
import { Affirmations, DailyGratitude, DearFutureSelf, SelfReflectSettings, WheelOfLifeSettings } from '@strive/model'
import { Firestore } from '@angular/fire/firestore'
import { collection, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'
import { toDate, collectionData } from '@strive/utils/firebase'
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
  private injector = inject(Injector)

  collectionData(options: { uid: string }): Observable<ExerciseSettings[]> {
    const colRef = collection(this.firestore, `Users/${options.uid}/Exercises`).withConverter(converter)
    return collectionData(this.injector, colRef, { idField: 'id' })
  }
}
