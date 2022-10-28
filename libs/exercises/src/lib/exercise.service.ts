import { Injectable } from '@angular/core'
import { Affirmations, DailyGratefulness, DearFutureSelf, WheelOfLifeSettings } from '@strive/model'
import { DocumentSnapshot } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'

export type ExerciseSettings = Affirmations | DailyGratefulness | WheelOfLifeSettings | DearFutureSelf

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