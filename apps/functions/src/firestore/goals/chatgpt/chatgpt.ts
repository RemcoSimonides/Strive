import { db, onDocumentCreate } from '@strive/api/firebase'
import { ChatGPTMessage, createChatGPTMessage, createMilestone } from '@strive/model'
import { toDate } from '../../../shared/utils'
import { ChatCompletionMessageParam } from 'openai/resources'
import { AskOpenAIConfig, askOpenAI } from '../../../shared/ask-open-ai/ask-open-ai'
import { parsePartialArray } from '../../../shared/ask-open-ai/parse'
import { GlobalOptions } from 'firebase-functions/v2'

const config: GlobalOptions = {
  timeoutSeconds: 540,
  memory: '1GiB',
}

// One answer carries both the roadmap and the questions that would sharpen it: a single call instead of two,
// and the questions are about the roadmap the user is actually looking at.
const roadmapConfig: AskOpenAIConfig = {
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'roadmap',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          milestones: { type: 'array', items: { type: 'string' }, description: 'The milestones of the roadmap, in the order they should be done' },
          questions: { type: 'array', items: { type: 'string' }, description: '3 questions to ask the user to make the roadmap more specific' }
        },
        required: ['milestones', 'questions'],
        additionalProperties: false
      }
    }
  },
  parse: raw => parsePartialArray(raw, 'milestones')
}

const roadmapInstruction = `Give the milestones of the roadmap and 3 questions you would ask the user to create a more specific roadmap.`

/** Streams the roadmap into RoadmapSuggestion and puts the questions of the same answer into RoadmapMoreInfoQuestions. */
async function askRoadmap(goalId: string, messages: ChatCompletionMessageParam[]) {
  const answer = await askOpenAI(messages, db.doc(`Goals/${goalId}/ChatGPT/RoadmapSuggestion`), roadmapConfig)

  const failed = answer === 'error'
  const questions: Partial<ChatGPTMessage> = {
    type: 'RoadmapMoreInfoQuestions',
    status: failed ? 'error' : 'completed',
    answerRaw: failed ? '' : answer,
    answerParsed: failed ? [] : parsePartialArray(answer, 'questions')
  }
  await db.doc(`Goals/${goalId}/ChatGPT/RoadmapMoreInfoQuestions`).set(questions, { merge: true })
}

export const chatGPTMessageCreatedHandler = onDocumentCreate(`Goals/{goalId}/ChatGPT/{messageId}`,
async (snapshot) => {

  const { goalId, messageId } = snapshot.params
  const message = createChatGPTMessage(toDate({ ...snapshot.data.data(), id: messageId }))

  // doc is created in function of another trigger already
  if (message.status === 'no-trigger') return

  // The questions come with the roadmap now (askRoadmap). App versions from before that still create this doc
  // next to RoadmapSuggestion; answering it separately would only cost a second call.
  if (message.type === 'RoadmapMoreInfoQuestions') return

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: `You're a life coach helping the user to break down its goal in smaller steps and help the user to stay focused on this goal` },
  ]

  if (message.type === 'RoadmapSuggestion') {
    messages.push({ role: 'user', content: `${message.prompt} ${roadmapInstruction}` })
    await askRoadmap(goalId, messages)
    return
  }

  if (message.type === 'RoadmapMoreInfoAnswers') {
    const snaps = await db.collection(`Goals/${goalId}/ChatGPT`).get()
    const existing = snaps.docs.map(doc => createChatGPTMessage(toDate({ ...doc.data(), id: doc.id })))

    const roadmap = existing.find(m => m.type === 'RoadmapSuggestion')
    const qa = existing.filter(m => m.type === 'RoadmapMoreInfoAnswers').map(m => m.prompt).join(', ')

    if (!roadmap) throw new Error('Need roadmap because it contains the initial goal description')

    messages.push({ role: 'user', content: roadmap.prompt })
    messages.push({ role: 'assistant', content: roadmap.answerRaw })
    messages.push({
      role: 'user',
      content: `Here is some more information about the goal: ${qa}. Please further specify the roadmap based on this information. ${roadmapInstruction}`
    })

    await askRoadmap(goalId, messages)
    return
  }

  if (message.type === 'RoadmapUpdateSuggestion') {
    const [ milestoneSnaps, messagesSnaps ] = await Promise.all([
      db.collection(`Goals/${goalId}/Milestones`).where('deletedAt', '==', null).get(),
      db.collection(`Goals/${goalId}/ChatGPT`).get()
    ])
    const existing = messagesSnaps.docs.map(doc => createChatGPTMessage(toDate({ ...doc.data(), id: doc.id })))

    const roadmap = existing.find(m => m.type === 'RoadmapSuggestion')
    const qa = existing.filter(m => m.type === 'RoadmapMoreInfoAnswers').map(m => m.prompt).join(', ')

    if (roadmap) {
      messages.push({ role: 'user', content: roadmap.prompt })
      messages.push({ role: 'assistant', content: roadmap.answerRaw })
    } else {
      // initial roadmap has been added to the prompt of this message in case it doesnt exist yet
      messages.push({ role: 'user', content: message.prompt })
      await db.doc(`Goals/${goalId}/ChatGPT/RoadmapSuggestion`).set(createChatGPTMessage({ prompt: message.prompt, type: 'RoadmapSuggestion', status: 'no-trigger' }))
    }

    const milestones = milestoneSnaps.docs.map(doc => createMilestone(toDate({ ...doc.data(), id: doc.id })))
    const achieved = milestones.filter(milestone => milestone.status === 'succeeded').map(milestone => milestone.content).join(', ')
    const failed = milestones.filter(milestone => milestone.status === 'failed').map(milestone => milestone.content).join(', ')
    const pending = milestones.filter(milestone => milestone.status === 'pending').map(milestone => milestone.content).join(', ')

    if (achieved.length || failed.length || pending.length) {
      if (qa) messages.push({ role: 'user', content: `Here is some more information about the goal: ${qa}.` })
      if (achieved.length) messages.push({ role: 'user', content: `These milestones I have already achieved: ${achieved}` })
      if (failed.length) messages.push({ role: 'user', content: `These milestones I have tried but have failed: ${failed}` })
      if (pending.length) messages.push({ role: 'user', content: `These milestones I still have to do: ${pending}` })

      messages.push({
        role: 'user',
        content: `Could you please update the roadmap based on this information? Only include milestones that still need to be done. ${roadmapInstruction}`
      })
    } else {
      messages.push({ role: 'user', content: roadmapInstruction })
    }

    await askRoadmap(goalId, messages)
    return
  }

}, config)
