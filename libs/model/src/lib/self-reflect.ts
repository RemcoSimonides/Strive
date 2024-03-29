export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type WeekdayWithNever = Weekday | 'never'
export type SelfReflectFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type SelfReflectFrequencyWithNever = SelfReflectFrequency | 'never'
export type SelfReflectType = 'formlist' | 'textarea' | 'prioritizeGoals' | 'wheelOfLife'
export type SelfReflectTense = 'future' | 'present' | 'past'

export interface EntryStep {
  category: SelfReflectCategory | ''
  tense: SelfReflectTense | 'previousIntention' | ''
}

export function getFrequency(value: SelfReflectFrequencyWithNever): string {
  switch (value) {
    case 'daily': return 'day'
    case 'weekly': return 'week'
    case 'monthly': return 'month'
    case 'quarterly': return 'quarter'
    case 'yearly': return 'year'
    case 'never': return '...'
    default: return ''
  }
}

export function replaceFrequency(value: string, frequency: SelfReflectFrequencyWithNever): string {
  return value.replace('{frequency}', getFrequency(frequency))
}

export const selfReflectCategories = [
  'intermediate',
  'previousIntention',
  'career',
  'creative',
  'education',
  'environment',
  'financial',
  'healthAndFitness',
  'personalDevelopment',
  'relationships',
  'spiritual',
  'travelAndAdventures',
  'other',
  'dearFutureSelf',
  'prioritizeGoals',
  'wheelOfLife',
  'gratitude',
  'outro'
] as const
export type SelfReflectCategory = typeof selfReflectCategories[number]

export const categoryLabels: Record<SelfReflectCategory, string> = {
  intermediate: '',
  previousIntention: 'Previous intentions',
  career: 'Career',
  creative: 'Creative',
  education: 'Education',
  environment: 'Environment',
  financial: 'Financial',
  healthAndFitness: 'Health and Fitness',
  personalDevelopment: 'Personal Development',
  relationships: 'Relationships',
  spiritual: 'Spiritual',
  travelAndAdventures: 'Travel and Adventures',
  other: 'Other',
  dearFutureSelf: 'Dear Future Self',
  wheelOfLife: 'Wheel of Life',
  gratitude: 'Gratitude',
  prioritizeGoals: 'Prioritize Goals',
  outro: ''
}

export interface SelfReflectQuestion {
  key: string
  question: string
  type: SelfReflectType
  frequency: SelfReflectFrequencyWithNever
  category: SelfReflectCategory
  tense: SelfReflectTense
}

export const selfReflectQuestions: SelfReflectQuestion[] = [
  {
    key: 'gratitude',
    question: 'What are you grateful for past {frequency}?',
    type: 'formlist',
    frequency: 'weekly',
    category: 'gratitude',
    tense: 'past'
  },
  {
    key: 'timeManagementFutureMoreTime',
    question: 'What will you spend more time on upcoming {frequency}?',
    type: 'formlist',
    frequency: 'weekly',
    category: 'personalDevelopment',
    tense: 'future'
  },
  {
    key: 'timeManagementFutureLessTime',
    question: 'What will you spend less time on upcoming {frequency}?',
    type: 'formlist',
    frequency: 'weekly',
    category: 'personalDevelopment',
    tense: 'future'
  },
  {
    key: 'environmentPast',
    question: 'What did you do past {frequency} to leave the world in a better shape than you found it?',
    type: 'formlist',
    frequency: 'monthly',
    category: 'environment',
    tense: 'past'
  },
  {
    key: 'forgive',
    question: 'Did anything happen during the past {frequency} that needs to be forgiven or let go of?',
    type: 'formlist',
    frequency: 'monthly',
    category: 'relationships',
    tense: 'past'
  },
  {
    key: 'prioritizeGoals',
    question: 'Order goals by priority',
    type: 'prioritizeGoals',
    frequency: 'monthly',
    category: 'prioritizeGoals',
    tense: 'future'
  },

  {
    key: 'explorePast',
    question: 'What places did you explore past {frequency}?',
    type: 'formlist',
    frequency: 'quarterly',
    category: 'travelAndAdventures',
    tense: 'past'
  },
  {
    key: 'exploreFuture',
    question: 'What places do you want to explore upcoming {frequency}?',
    type: 'formlist',
    frequency: 'quarterly',
    category: 'travelAndAdventures',
    tense: 'future'
  },
  {
    key: 'wheelOfLife',
    question: 'Fill in the Wheel of Life',
    type: 'wheelOfLife',
    frequency: 'quarterly',
    category: 'wheelOfLife',
    tense: 'present'
  },
  {
    key: 'financialMoreFuture',
    question: 'What are you going to spend more money on upcoming {frequency}?',
    type: 'formlist',
    frequency: 'quarterly',
    category: 'financial',
    tense: 'future'
  },
  {
    key: 'financialLessFuture',
    question: 'What are you going to spend less money on upcoming {frequency}?',
    type: 'formlist',
    frequency: 'quarterly',
    category: 'financial',
    tense: 'future',
  },
  {
    key: 'relationshipGainEnergy',
    question: 'Who of the people you spend time with gave you energy past {frequency}?',
    type: 'formlist',
    frequency: 'yearly',
    category: 'relationships',
    tense: 'past'
  },
  {
    key: 'relationshipDrainEnergy',
    question: 'Who of the people you spend time with drained your energy past {frequency}?',
    type: 'formlist',
    frequency: 'yearly',
    category: 'relationships',
    tense: 'past'
  },
  {
    key: 'relationshipMoreTime',
    question: 'With who do you want to spend more time upcoming {frequency}?',
    type: 'formlist',
    frequency: 'yearly',
    category: 'relationships',
    tense: 'future'
  },
  {
    key: 'relaionshipGoals',
    question: 'What are your relationship goals for the upcoming {frequency}?',
    type: 'textarea',
    frequency: 'yearly',
    category: 'relationships',
    tense: 'future'
  },
  {
    key: 'dearFutureSelfAdvice',
    question: 'What advice would you give yourself in one {frequency}?',
    type: 'textarea',
    frequency: 'yearly',
    category: 'dearFutureSelf',
    tense: 'future'
  },
  {
    key: 'dearFutureSelfPrediction',
    question: 'What predictions do you make what will happen upcoming {frequency}?',
    type: 'textarea',
    frequency: 'yearly',
    category: 'dearFutureSelf',
    tense: 'future'
  },
  {
    key: 'imagineFuture',
    question: 'Imagine yourself 5 years in the future. What would your life look like?',
    type: 'textarea',
    frequency: 'yearly',
    category: 'dearFutureSelf',
    tense: 'future'
  },
  {
    key: 'imagineDie',
    question: 'What would you do in the next 5 years if you were to die right after those years?',
    type: 'textarea',
    frequency: 'yearly',
    category: 'dearFutureSelf',
    tense: 'future'
  },
  {
    key: 'healthAndFitnessPast',
    question: 'How has my overall health been past {frequency}?',
    type: 'textarea',
    frequency: 'yearly',
    category: 'healthAndFitness',
    tense: 'past'
  },
  {
    key: 'healthAndFitnessExerciseFuture',
    question: 'What healthy habits are you going to start upcoming {frequency}?',
    type: 'formlist',
    frequency: 'yearly',
    category: 'healthAndFitness',
    tense: 'future'
  }
]

export const selfReflectKeys = selfReflectQuestions.map(({ key }) => key)

export const selfReflectSettings: SelfReflectSettings = {
  preferredDay: 'sunday',
  preferredTime: '19:00',
  questions: selfReflectQuestions,
  createdAt: new Date(),
  updatedAt: new Date()
}

export function createSelfReflectQuestion(params: Partial<SelfReflectQuestion> = {}): SelfReflectQuestion {
  return {
    key: params.key ?? '',
    category: params.category ?? 'other',
    question: params.question ?? '',
    type: params.type ?? 'textarea',
    frequency: params.frequency ?? 'yearly',
    tense: params.tense ?? 'past'
  }
}

export interface SelfReflectSettings {
  id?: string
  questions: SelfReflectQuestion[]
  preferredDay: WeekdayWithNever,
  preferredTime: string,
  createdAt: Date
  updatedAt: Date
}

export function createSelfReflectSettings(params: Partial<SelfReflectSettings> = {}): SelfReflectSettings {
  return {
    ...params,
    id: params.id ?? '',
    questions: params.questions ? params.questions.map(createSelfReflectQuestion) : [],
    preferredDay: params.preferredDay ?? 'sunday',
    preferredTime: params.preferredTime ?? '19:00',
    createdAt: params.createdAt ?? new Date(),
    updatedAt: params.updatedAt ?? new Date()
  }
}

export interface SelfReflectEntry {
  id?: string
  config: SelfReflectQuestion[],
  dearFutureSelfAdvice?: string
  dearFutureSelfPrediction?: string
  environmentPast?: string[]
  environmentFuture?: string[]
  explorePast?: string[]
  exploreFuture?: string[]
  forgive?: string[]
  gratitude?: string[]
  imagineFuture?: string
  imagineDie?: string
  frequency: SelfReflectFrequency
  prioritizeGoals?: string[]
  timeManagementPast?: string[]
  timeManagementFutureMoreTime?: string[]
  timeManagementFutureLessTime?: string[]
  wheelOfLife?: WheelOfLife
  createdAt: Date
  updatedAt: Date
  [key: string]: string | string[] | undefined | WheelOfLife | Date | SelfReflectQuestion[] // needs to have all possible types
}

export function createSelfReflectEntry(params: Partial<SelfReflectEntry> = {}): SelfReflectEntry {
  return {
    ...params,
    config: params.config ?? [],
    frequency: params.frequency ?? 'weekly',
    createdAt: params.createdAt ?? new Date(),
    updatedAt: params.updatedAt ?? new Date(),
  }
}

export interface WheelOfLife {
  career: number | string
  development: number | string
  environment: number | string
  family: number | string
  friends: number | string
  fun: number | string
  health: number | string
  love: number | string
  money: number | string
  spirituality: number | string
}

export function createWheelOfLife(params?: Partial<WheelOfLife>): WheelOfLife {
  return {
    career: params?.career ?? '',
    development: params?.development ?? '',
    environment: params?.environment ?? '',
    family: params?.family ?? '',
    friends: params?.friends ?? '',
    fun: params?.fun ?? '',
    health: params?.health ?? '',
    love: params?.love ?? '',
    money: params?.money ?? '',
    spirituality: params?.spirituality ?? ''
  }
}