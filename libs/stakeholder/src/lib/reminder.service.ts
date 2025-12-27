import { Injectable, inject } from '@angular/core'
import { DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { FireSubCollection } from 'ngfire'
import { toDate } from '@strive/utils/firebase'

import { AuthService } from '@strive/auth/auth.service'

import { Reminder, createReminder } from '@strive/model'

@Injectable({
  providedIn: 'root'
})
export class ReminderService extends FireSubCollection<Reminder> {
  private auth = inject(AuthService);

  readonly path = 'Goals/:goalId/GStakeholders/:uid/Reminders'
  override readonly memorize = true

  constructor() {
    super()
  }

  override fromFirestore(snapshot: DocumentSnapshot<Reminder>) {
    return snapshot.exists()
      ? createReminder(toDate({ ...snapshot.data(), id: snapshot.id, path: snapshot.ref.path }))
      : undefined
  }

  override async toFirestore(reminder: Reminder, actionType: 'add' | 'update'): Promise<Reminder> {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') {
      reminder = createReminder({
        ...reminder,
        createdAt: timestamp
      })
    }

    reminder.updatedAt = timestamp
    reminder.updatedBy = this.auth.uid

    return reminder
  }
}