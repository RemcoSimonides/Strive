import { Injectable } from '@angular/core'
import { DocumentSnapshot, QueryDocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { FireSubCollection } from 'ngfire'
import { toDate } from '@strive/utils/firebase'

import { ChatGPTMessage, Goal, createChatGPTMessage } from '@strive/model'
import { format } from 'date-fns'
import { getCountry } from '@strive/utils/country'

@Injectable({
  providedIn: 'root'
})
export class ChatGPTService extends FireSubCollection<ChatGPTMessage> {
  readonly path = `Goals/:goalId/ChatGPT`
  override readonly memorize = true

  protected override toFirestore(message: ChatGPTMessage, actionType: 'add' | 'update'): ChatGPTMessage {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') message.createdAt = timestamp
    message.updatedAt = timestamp

    return message
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<ChatGPTMessage> | QueryDocumentSnapshot<ChatGPTMessage>): ChatGPTMessage | undefined {
    return snapshot.exists()
      ? createChatGPTMessage(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }

  getInitialPrompt(goal: Goal) {
    const { deadline, title  } = goal
    const end = format(deadline, 'dd MMMM yyyy')
    const today = format(new Date(), 'dd MMMM yyyy')
    const country = getCountry() ?? 'The Netherlands'
    return `I want to achieve "${title}" by ${end}. Today is ${today} and I live in ${country}. Could you break it down into milestones? Take the preparation, execution and celebration of the goal in account. Please don't suggest a due date for the milestones and don't use numbering for each milestone. Also the milestones should be specific and measurable but not longer than once sentence. Cap out at 12 milestones.`
  }

}
