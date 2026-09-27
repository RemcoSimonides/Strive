import { onDocumentCreate, db } from '@strive/api/firebase'

import { createComment, createGoal, createGoalStakeholder, createMilestone } from '@strive/model'
import { toDate } from '../../../shared/utils'
import { addGoalEvent } from '../../../shared/goal-event/goal.events'
import { ChatCompletionMessageParam } from 'openai/resources'
import { askOpenAI } from '../../../shared/ask-open-ai/ask-open-ai'
import { format } from 'date-fns'

// earlier messages sent along as context; keeps long chats from growing the prompt without bound
const historyLimit = 30

export const commentCreatedHandler = onDocumentCreate(`Goals/{goalId}/Comments/{commentId}`,
async (snapshot) =>{

  const { commentId, goalId } = snapshot.params
  const comment = createComment(toDate({ ...snapshot.data.data(), id: commentId }))
  const { userId } = comment

  if (comment.id === 'initial') return // no need to send notification of the initial message

  // An assistant comment is created empty and its answer streams in afterwards: its event is added below,
  // once the answer is complete, so the push notification has something to show.
  if (comment.userId === 'chatgpt') return

  addGoalEvent('goalChatMessageCreated', { goalId, userId, commentId })

  const [ goalSnap, stakeholderSnap ] = await Promise.all([
    db.doc(`Goals/${goalId}`).get(),
    db.doc(`Goals/${goalId}/GStakeholders/${userId}`).get()
  ])
  const goal = createGoal(toDate({ ...goalSnap.data(), id: goalSnap.id }))
  const stakeholder = createGoalStakeholder(toDate({ ...stakeholderSnap.data(), id: stakeholderSnap.id }))

  if (!goal.enableAssistant) return
  if (!stakeholder.isAdmin && !stakeholder.isAchiever) return // only respond to admins and achievers

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: `You're a coach helping the user to achieve its goal by asking questions and motivating using short answers` },
  ]

  const data = createComment({ userId: 'chatgpt' })

  const [ref, milestonesSnap, commentsSnap] = await Promise.all([
    db.collection(`Goals/${goalId}/Comments`).add(data),
    db.collection(`Goals/${goalId}/Milestones`).where('deletedAt', '==', null).get(),
    db.collection(`Goals/${goalId}/Comments`).get()
  ])

  const milestones = milestonesSnap.docs.map(doc => createMilestone(toDate({ ...doc.data(), id: doc.id })))
  // history in the order it was written, without the message being answered (pushed last below)
  // and without the empty placeholder that will hold this answer
  const comments = commentsSnap.docs
    .map(doc => createComment(toDate({ ...doc.data(), id: doc.id })))
    .filter(c => c.id !== commentId && c.id !== ref.id)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(-historyLimit)

  let content = `For context: I want to achieve "${goal.title}" by ${format(goal.deadline, 'dd MMMM yyyy')}.`

  if (milestones.length) {
    const milestonesList = milestones.map(m => `${m.content}${ m.deadline ? ` by ${format(m.deadline, 'dd MMMM yyyy')}` : ''} (${m.status})`).join(', ')
    const milestonesText = `This goal is broken down into ${milestones.length} milestones. ${milestonesList}.`
    content += ` ${milestonesText}`
  }

  messages.push({ role: 'user', content })

  comments.forEach(comment => {
    // answers of the assistant are streamed into answerRaw, its fixed messages (like 'initial') into text
    const role = comment.userId === 'chatgpt' ? 'assistant' : 'user'
    const content = comment.text || comment.answerRaw
    if (content) messages.push({ role, content })
  })

  messages.push({ role: 'user', content: comment.text })

  const answer = await askOpenAI(messages, ref)
  if (answer !== 'error') await addGoalEvent('goalChatMessageCreated', { goalId, userId: 'chatgpt', commentId: ref.id })
})