import OpenAI from 'openai'
import { Category, Goal, Milestone, categories } from '@strive/model'
import { OPENAI_MODEL } from './ask-open-ai'

export async function categorizeGoal(goal: Goal, milestones?: Milestone[]): Promise<Category[]> {

  let message = `My goal is to "${goal.title}".`
  if (goal.description) message += ` The description is: ${goal.description}.`
  if (milestones?.length) message += ` The milestones are: ${milestones.slice(0, 10).map(m => m.content).join(', ')}.`
  message += ` Please categorize this goal in one or more of the given categories.`

  const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY })

  // the enum lets the model answer only with categories that exist
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'categories',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            categories: { type: 'array', items: { type: 'string', enum: categories.map(c => c.title) } }
          },
          required: ['categories'],
          additionalProperties: false
        }
      }
    },
    messages: [{ role: 'user', content: message }]
  })

  const content = response.choices[0].message?.content ?? '{}'
  const titles: string[] = JSON.parse(content).categories ?? []
  const ids = categories.filter(c => titles.includes(c.title)).map(c => c.id)

  return ids.length ? ids : ['other']
}
