import { RuntimeOptions, db, onDocumentCreate } from '@strive/api/firebase'
import { createChatGPTMessage, createMilestone } from '@strive/model'
import { toDate } from '../../../shared/utils'
import { ChatCompletionMessageParam } from 'openai/resources'
import { AskOpenAIConfig, askOpenAI } from '../../../shared/ask-open-ai/ask-open-ai'

const config: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: '1GB',
}

const askOpenAIConfig: AskOpenAIConfig = {
  model: 'gpt-4',
  parse: true
}

const parsablePrompt = `The format of your response has to be a JSON parsable array of strings.`

export const chatGPTMessageCreatedHandler = onDocumentCreate(`Goals/{goalId}/ChatGPT/{messageId}`, 'chatGPTMessageCreatedHandler',
async (snapshot, context) => {

  const message = createChatGPTMessage(toDate({ ...snapshot.data(), id: snapshot.id }))
  const goalId = context.params.goalId

  // doc is created in function of another trigger already
  if (message.status === 'no-trigger') return

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: `You're a life coach helping the user to break down its goal in smaller steps and help the user to stay focused on this goal` },
  ]

  if (message.type === 'RoadmapSuggestion') {
    messages.push({
      role: 'user',
      content: `${message.prompt} ${parsablePrompt}`
    })
    await askOpenAI(messages, snapshot.ref, askOpenAIConfig)
    return
  }

  if (message.type === 'RoadmapMoreInfoQuestions') {
    const content = `${message.prompt} ${parsablePrompt}`
    messages.push({ role: 'user', content })
    await askOpenAI(messages, snapshot.ref, askOpenAIConfig)
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
      content: `Here is some more information about the goal: ${qa}. Please further specify the roadmap based on this information. ${parsablePrompt}`
    })

    const answer = await askOpenAI(messages, db.doc(`Goals/${goalId}/ChatGPT/RoadmapSuggestion`), askOpenAIConfig)

    messages.push({ role: 'assistant', content: answer })
    messages.push({
      role: 'user',
      content: `What are 3 questions you would ask the user to create a more specific roadmap? ${parsablePrompt}`
    })

    await askOpenAI(messages, db.doc(`Goals/${goalId}/ChatGPT/RoadmapMoreInfoQuestions`), askOpenAIConfig)
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
    const questions = existing.find(m => m.type === 'RoadmapMoreInfoQuestions')

    if (roadmap) {
      messages.push({ role: 'user', content: roadmap.prompt })
      messages.push({ role: 'assistant', content: roadmap.answerRaw })
    } else {
      // initial roadmap has been added to the prompt of this message in case it doesnt exist yet
      messages.push({ role: 'user', content: message.prompt })
      await db.doc(`Goals/${goalId}/ChatGPT/RoadmapSuggestion`).set(createChatGPTMessage({ prompt: message.prompt, type: 'RoadmapSuggestion', status: 'no-trigger' }))
    }

    if (!questions) {
      await db.doc(`Goals/${goalId}/ChatGPT/RoadmapMoreInfoQuestions`).set(createChatGPTMessage({ type: 'RoadmapMoreInfoQuestions', status: 'no-trigger' }))
    }

    const milestones = milestoneSnaps.docs.map(doc => createMilestone(toDate({ ...doc.data(), id: doc.id })))
    const achieved = milestones.filter(milestone => milestone.status === 'succeeded').map(milestone => milestone.content).join(', ')
    const failed = milestones.filter(milestone => milestone.status === 'failed').map(milestone => milestone.content).join(', ')
    const pending = milestones.filter(milestone => milestone.status === 'pending').map(milestone => milestone.content).join(', ')

    if (achieved.length || failed.length || pending.length) {
      messages.push({
        role: 'user',
        content: `Here is some more information about the goal: ${qa}.`
      })

      if (achieved.length) {
        messages.push({
          role: 'user',
          content: `These milestones I have already achieved: ${achieved}`
        })
      }

      if (failed.length) {
        messages.push({
          role: 'user',
          content: `These milestones I have tried but have failed: ${failed}`
        })
      }

      if (pending.length) {
        messages.push({
          role: 'user',
          content: `These milestones I still have to do: ${pending}`
        })
      }

      messages.push({
        role: 'user',
        content: `Could you please update the roadmap based on this information? Only include milestones that still need to be done. ${parsablePrompt}`
      })
    }

    const answer = await askOpenAI(messages, db.doc(`Goals/${goalId}/ChatGPT/RoadmapSuggestion`), askOpenAIConfig)

    messages.push({ role: 'assistant', content: answer })
    messages.push({
      role: 'user',
      content: `What are 3 questions you would ask the user to create a more specific roadmap? ${parsablePrompt}`
    })

    await askOpenAI(messages, db.doc(`Goals/${goalId}/ChatGPT/RoadmapMoreInfoQuestions`), askOpenAIConfig)

    return
  }

}, config)