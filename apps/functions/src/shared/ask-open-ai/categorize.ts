import OpenAI from 'openai'
import { parseRaw } from './parse'
import { CategoryBlock, Goal, Milestone, categories } from '@strive/model'
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

  const content = response.choices[0].message?.content ?? ''
  const parsed = parseRaw(content) ?? []

  // keep only answers that match a known category; the model may invent one
  const ids = parsed
    .map(title => categories.find(c => c.title.toLowerCase() === title.trim().toLowerCase()))
    .filter((category): category is CategoryBlock => !!category)
    .map(category => category.id)

  return ids.length ? [...new Set(ids)] : ['other']
}