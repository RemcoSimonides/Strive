import OpenAI from 'openai'
import { parseRaw } from './parse'
import { Goal, Milestone, categories } from '@strive/model'
import { smartJoin } from '@strive/utils/helpers'

export async function categorizeGoal(goal: Goal, milestones?: Milestone[]): Promise<string[]> {

  let message = `My goal is to "${goal.title}".`
  if (goal.description) message += ` The description is: ${goal.description}.`
  if (milestones?.length) message += ` The milestones are: ${milestones.slice(0, 10).map(m => m.content).join(', ')}.`

  const categoryTitles = smartJoin(categories.map(c => `"${c.title}"`), ', ', ', and ')
  message += ` Please categorize this goal in one or more categories of the following categories: ${categoryTitles}.`

  const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY })

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: `${message} The format of your response has to be a JSON parsable array of strings and the string must match the category name exactly.`
      }
    ]
  })

  const content = response.choices[0].message?.content
  const parsed = parseRaw(content) ?? ['Other']

  // filter out the ones that are not in categories
  parsed.filter(category => !categories.map(c => c.title.toLowerCase()).includes(category.toLowerCase()))

  const result = parsed.map(category => categories.find(c => c.title.toLowerCase() === category.toLowerCase())).map(c => c.id)

  return result
}