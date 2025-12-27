import { Injectable } from '@angular/core'
import { Affirmations, DailyGratitude, DearFutureSelf, SelfReflectSettings, WheelOfLifeSettings } from '@strive/model'
import { DocumentSnapshot } from 'firebase/firestore'
import { FireSubCollection } from 'ngfire'
import { toDate } from '@strive/utils/firebase'

export type ExerciseSettings = Affirmations | DailyGratitude | WheelOfLifeSettings | DearFutureSelf | SelfReflectSettings

@Injectable({providedIn: 'root'})
export class ExerciseService extends FireSubCollection<ExerciseSettings> {
  readonly path = 'Users/:uid/Exercises'
  override readonly memorize = true

  protected override toFirestore() {
    throw new Error('Dont write to firestore using this service. Use dedicated service for each exercise instead')
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<ExerciseSettings>) {
    if (!snapshot.exists()) return
    return toDate<ExerciseSettings>({ ...snapshot.data(), id: snapshot.id })
  }
}