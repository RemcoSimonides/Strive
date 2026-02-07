import { inject, Injectable, Injector } from '@angular/core'
import { Firestore, addDoc, setDoc } from '@angular/fire/firestore'
import { collection, doc, query, QueryConstraint } from 'firebase/firestore'
import { createConverter, collectionData } from '@strive/utils/firebase'

import { Comment, createComment } from '@strive/model'
import { Observable } from 'rxjs'

const converter = createConverter<Comment>(createComment)

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private firestore = inject(Firestore)
  private injector = inject(Injector)

  collectionData(queryConstraints: QueryConstraint[], options: { goalId: string }): Observable<Comment[]> {
    const colPath = `Goals/${options.goalId}/ChatGPT`
    const colRef = collection(this.firestore, colPath).withConverter(converter)
    const q = query(colRef, ...queryConstraints)
    return collectionData(this.injector, q, { idField: 'id' })
  }

  upsert(payload: Comment, options: { goalId: string }) {
      const colPath = `Goals/${options.goalId}/ChatGPT`

      if (payload.id) {
        const docRef = doc(this.firestore, `${colPath}/${payload.id}`).withConverter(converter)
        return setDoc(docRef, payload, { merge: true })
      } else {
        const colRef = collection(this.firestore, colPath).withConverter(converter)
        return addDoc(colRef, payload)
      }
    }
}
