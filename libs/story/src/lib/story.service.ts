import { Injectable, inject } from '@angular/core'
import { FIRESTORE } from '@strive/utils/firebase-init'
import { collection, doc, query, QueryConstraint } from 'firebase/firestore'
import { createConverter, docData, collectionData } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { createStoryItemBase, StoryItem } from '@strive/model'

const converter = createConverter<StoryItem>(createStoryItemBase as (data: any) => StoryItem)

@Injectable({ providedIn: 'root' })
export class StoryService {
  private firestore = inject(FIRESTORE)

  docData(id: string, options: { goalId: string }): Observable<StoryItem | undefined> {
    const docRef = doc(this.firestore, `Goals/${options.goalId}/Story/${id}`).withConverter(converter)
    return docData(docRef)
  }

  collectionData(constraints: QueryConstraint[], options: { goalId: string }): Observable<StoryItem[]> {
    const colRef = collection(this.firestore, `Goals/${options.goalId}/Story`).withConverter(converter)
    const q = query(colRef, ...constraints)
    return collectionData(q, { idField: 'id' })
  }
}
