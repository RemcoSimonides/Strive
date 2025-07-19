import { onDocumentCreate, db } from '@strive/api/firebase'

import { createComment, createGoal, createGoalStakeholder, createMilestone } from '@strive/model'
import { toDate } from '../../../shared/utils'
import { addGoalEvent } from '../../../shared/goal-event/goal.events'
import { ChatCompletionMessageParam } from 'openai/resources'
import { askOpenAI, AskOpenAIConfig } from '../../../shared/ask-open-ai/ask-open-ai'
import { format } from 'date-fns'

const askOpenAIConfig: AskOpenAIConfig = {
  model: 'gpt-4o',
  response_format: { type: 'text' },
  parse: false
}

export const commentCreatedHandler = onDocumentCreate(`Goals/{goalId}/Comments/{commentId}`,
async (snapshot) =>{

  const comment = createComment(toDate({ ...snapshot.data.data(), id: snapshot.id }))
  const { goalId } = snapshot.params
  const { userId } = comment

  if (comment.id === 'initial') return // no need to send notification of the initial message

  addGoalEvent('goalChatMessageCreated', { goalId, userId, commentId: comment.id })

  if (comment.userId === 'chatgpt') return

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
  const comments = commentsSnap.docs.map(doc => createComment(toDate({ ...doc.data(), id: doc.id })))

  let content = `For context: I want to achieve "${goal.title}" by ${format(goal.deadline, 'dd MMMM yyyy')}.`

  if (milestones.length) {
    const milestonesList = milestones.map(m => `${m.content}${ m.deadline ? ` by ${format(m.deadline, 'dd MMMM yyyy')}` : ''} (${m.status})`).join(', ')
    const milestonesText = `This goal is broken down into ${milestones.length} milestones. ${milestonesList}.`
    content += ` ${milestonesText}`
  }

  messages.push({ role: 'user', content })

  comments.forEach(comment => {
    const role = comment.userId === 'chatgpt' ? 'assistant' : 'user'
    messages.push({ role, content: comment.text })
  })

  messages.push({ role: 'user', content: comment.text })

  return askOpenAI(messages, ref, askOpenAIConfig)
})