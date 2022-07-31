import * as admin from 'firebase-admin';
import { AudienceType, createDiscussion } from "@strive/discussion/+state/discussion.firestore"
import { DiscussionSource } from "@strive/notification/+state/notification.firestore"

const db = admin.firestore()
const { serverTimestamp } = admin.firestore.FieldValue

// create discussion
export async function addDiscussion(title: string, source: DiscussionSource, audience: AudienceType, id?: string, stakeholderUID?: string): Promise<string> {

  // already add requestor as commentator --> if admin says something in discussion, requestor will receive notification of it
  const commentators = stakeholderUID ? [stakeholderUID] : []

  const discussion = createDiscussion({
    id: id ?? '',
    title,
    source,
    audience,
    commentators,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any
  })

  if (id) {
    await db.doc(`Discussions/${id}`).set(discussion)
    return id
  } else {
    const res = await db.collection(`Discussions`).add(discussion)
    return res.id
  }
}