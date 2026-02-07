import { inject, Injectable, Injector } from '@angular/core'
import { Firestore, addDoc, setDoc } from '@angular/fire/firestore'
import { collection, doc, getDocs, QueryConstraint, query } from 'firebase/firestore'
import { createConverter, docData, collectionData } from '@strive/utils/firebase'

import { ChatGPTMessage, Goal, createChatGPTMessage } from '@strive/model'
import { format } from 'date-fns'
import { getCountry } from '@strive/utils/country'
import { Observable } from 'rxjs'

const converter = createConverter<ChatGPTMessage>(createChatGPTMessage)

@Injectable({
  providedIn: 'root'
})
export class ChatGPTService {
  private firestore = inject(Firestore)
  private injector = inject(Injector)

  docData(id: string, options: { goalId: string }): Observable<ChatGPTMessage | undefined> {
    const docPath = `Goals/${options.goalId}/ChatGPT/${id}`
    const docRef = doc(this.firestore, docPath).withConverter(converter)
    return docData(this.injector, docRef)
  }

  collectionData(constraints: QueryConstraint[], options: { goalId: string }): Observable<ChatGPTMessage[]> {
    const colPath = `Goals/${options.goalId}/ChatGPT`
    const colRef = collection(this.firestore, colPath).withConverter(converter)
    const q = query(colRef, ...constraints)
    return collectionData(this.injector, q, { idField: 'id' })
  }

  getDocs(constraints: QueryConstraint[], options: { goalId: string }) {
    const colPath = `Goals/${options.goalId}/ChatGPT`
    const colRef = collection(this.firestore, colPath).withConverter(converter)
    const q = query(colRef, ...constraints)
    return getDocs(q).then(snapshot => {
      return snapshot.docs.map(doc => doc.data())
    })
  }

  upsert(message: ChatGPTMessage, options: { goalId: string }) {
    const colPath = `Goals/${options.goalId}/ChatGPT`

    if (message.id) {
      const docRef = doc(this.firestore, `${colPath}/${message.id}`).withConverter(converter)
      return setDoc(docRef, message, { merge: true })
    } else {
      const colRef = collection(this.firestore, colPath).withConverter(converter)
      return addDoc(colRef, message)
    }
  }

  getInitialPrompt(goal: Goal) {
    const { deadline, title  } = goal
    const end = format(deadline, 'dd MMMM yyyy')
    const today = format(new Date(), 'dd MMMM yyyy')
    const country = getCountry() ?? 'The Netherlands'
    return `I want to achieve "${title}" by ${end}. Today is ${today} and I live in ${country}. Could you break it down into milestones? Take the preparation, execution and celebration of the goal in account. Please don't suggest a due date for the milestones and don't use numbering for each milestone. Also the milestones should be specific and measurable but not longer than once sentence. Cap out at 12 milestones.`
  }
}
