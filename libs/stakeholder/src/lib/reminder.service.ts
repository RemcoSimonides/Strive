import { Injectable, Injector, inject } from '@angular/core'
import { Firestore, addDoc, setDoc, deleteDoc } from '@angular/fire/firestore'
import { collection, doc, DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, serverTimestamp, SnapshotOptions } from 'firebase/firestore'
import { collectionData, toDate } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { AuthService } from '@strive/auth/auth.service'

import { Reminder, createReminder } from '@strive/model'

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private firestore = inject(Firestore)
  private injector = inject(Injector)
  private auth = inject(AuthService)

  private converter: FirestoreDataConverter<Reminder | undefined> = {
    toFirestore: (reminder: Reminder) => {
      const isUpdate = !!reminder['id']
      const timestamp = serverTimestamp()
      const data = { ...reminder } as DocumentData

      if (!isUpdate) {
        data['createdAt'] = timestamp
      }
      data['updatedAt'] = timestamp
      data['updatedBy'] = this.auth.uid()

      delete data['id']
      return data
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
      if (snapshot.exists()) {
        const data = snapshot.data(options)
        return createReminder(toDate({ ...data, id: snapshot.id, path: snapshot.ref.path }))
      } else {
        return undefined
      }
    }
  }

  private getPath(options: { goalId: string, uid: string }) {
    return `Goals/${options.goalId}/GStakeholders/${options.uid}/Reminders`
  }

  collectionData(options: { goalId: string, uid: string }): Observable<Reminder[]> {
    const colRef = collection(this.firestore, this.getPath(options)).withConverter(this.converter)
    return collectionData(this.injector, colRef, { idField: 'id' }) as Observable<Reminder[]>
  }

  async add(reminder: Reminder, options: { goalId: string, uid: string }): Promise<string> {
    const colRef = collection(this.firestore, this.getPath(options)).withConverter(this.converter)
    const docRef = await addDoc(colRef, reminder)
    return docRef.id
  }

  upsert(reminder: Partial<Reminder> & { id: string }, options: { goalId: string, uid: string }) {
    const docRef = doc(this.firestore, `${this.getPath(options)}/${reminder.id}`).withConverter(this.converter)
    return setDoc(docRef, reminder as Reminder, { merge: true })
  }

  remove(reminderId: string, options: { goalId: string, uid: string }) {
    const ref = doc(this.firestore, `${this.getPath(options)}/${reminderId}`)
    return deleteDoc(ref)
  }
}
