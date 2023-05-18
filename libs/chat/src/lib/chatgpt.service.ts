import { Injectable } from '@angular/core'
import { DocumentSnapshot, QueryDocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'

import { ChatGPTMessage, createChatGPTMessage } from '@strive/model'

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

}
