export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type WeekdayWithNever = Weekday | 'never'
export type SelfReflectInterval = 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type SelfReflectIntervalWithNever = SelfReflectInterval | 'never'
export type SelfReflectType = 'formlist' | 'textarea' | 'prioritizeGoals' | 'wheelOfLife'
export type SelfReflectTense = 'future' | 'present' | 'past'

export interface EntryStep {
  category: SelfReflectCategory
  tense: SelfReflectTense | ''
}

export function getInterval(value: SelfReflectIntervalWithNever): string {
  switch (value) {
    case 'weekly': return 'week'
    case 'monthly': return 'month'
    case 'quarterly': return 'quarter'
    case 'yearly': return 'year'
    default: return ''
  }
}

export const selfReflectCategories = [
  'intro',
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

export interface SelfReflectQuestion {
  key: string
  question: string
  type: SelfReflectType
  interval: SelfReflectIntervalWithNever
  category: SelfReflectCategory
  tense: SelfReflectTense
}

export type SelfReflectQuestionConfig = Omit<SelfReflectQuestion, 'setting'>

export const selfReflectQuestions: SelfReflectQuestion[] = [
  {
    key: 'dearFutureSelfAdvice',
    question: 'What advice would you give yourself in one {interval}?',
    type: 'textarea',
    interval: 'yearly',
    category: 'dearFutureSelf',
    tense: 'future'
  },
  {
    key: 'dearFutureSelfPrediction',
    question: 'What predictions do you make what will happen upcoming {interval}?',
    type: 'textarea',
    interval: 'yearly',
    category: 'dearFutureSelf',
    tense: 'future'
  },
  {
    key: 'dearFutureSelfAnythingElse',
    question: 'Anything else you would like to mention?',
    type: 'textarea',
    interval: 'yearly',
    category: 'dearFutureSelf',
    tense: 'future'
  },
  {
    key: 'environmentPast',
    question: 'What did you do past {interval} to leave the world in a better shape than you found it?',
    type: 'formlist',
    interval: 'monthly',
    category: 'environment',
    tense: 'past'
  },
  {
    key: 'environmentFuture',
    question: 'What do you want to explore upcoming {interval}?',
    type: 'formlist',
    interval: 'monthly',
    category: 'environment',
    tense: 'future'
  },
  {
    key: 'explorePast',
    question: 'What did you explore past {interval}?',
    type: 'formlist',
    interval: 'quarterly',
    category: 'travelAndAdventures',
    tense: 'past'
  },
  {
    key: 'exploreFuture',
    question: 'What do you want to explore upcoming {interval}?',
    type: 'formlist',
    interval: 'quarterly',
    category: 'travelAndAdventures',
    tense: 'future'
  },
  {
    key: 'forgive',
    question: 'Did anything happen during the past {interval} that needs to be forgiven or let go of?',
    type: 'formlist',
    interval: 'monthly',
    category: 'relationships',
    tense: 'past'
  },
  {
    key: 'gratitude',
    question: 'What are you grateful for past {interval}?',
    type: 'formlist',
    interval: 'weekly',
    category: 'gratitude',
    tense: 'past'
  },
  {
    key: 'imagineFuture',
    question: 'Imagine yourself 5 years in the future. What would your life look like?',
    type: 'textarea',
    interval: 'yearly',
    category: 'dearFutureSelf',
    tense: 'future'
  },
  {
    key: 'imagineDie',
    question: 'What would you do in the next 5 years if you were to die right after those years?',
    type: 'textarea',
    interval: 'yearly',
    category: 'dearFutureSelf',
    tense: 'future'
  },
  {
    key: 'learnFuture',
    question: 'What do you want to learn upcoming {interval}?',
    type: 'formlist',
    interval: 'weekly',
    category: 'education',
    tense: 'future'
  },
  {
    key: 'learnPast',
    question: 'What did you learn past {interval}?',
    type: 'formlist',
    interval: 'weekly',
    category: 'education',
    tense: 'past'
  },
  {
    key: 'prioritizeGoals',
    question: 'Order goals by priority',
    type: 'prioritizeGoals',
    interval: 'monthly',
    category: 'prioritizeGoals',
    tense: 'future'
  },
  {
    key: 'pride',
    question: 'What are you proud of past {interval}?',
    type: 'formlist',
    interval: 'weekly',
    category: 'personalDevelopment',
    tense: 'past'
  },
  {
    key: 'timeManagementFutureMoreTime',
    question: 'What will you spend more time on upcoming {interval}?',
    type: 'formlist',
    interval: 'weekly',
    category: 'personalDevelopment',
    tense: 'future'
  },
  {
    key: 'timeManagementFutureLessTime',
    question: 'What will you spend less time on upcoming {interval}?',
    type: 'formlist',
    interval: 'weekly',
    category: 'personalDevelopment',
    tense: 'future'
  },
  {
    key: 'timeManagementPast',
    question: 'What did you spend too much time on past {interval}?',
    type: 'formlist',
    interval: 'weekly',
    category: 'personalDevelopment',
    tense: 'past'
  },
    {
    key: 'wheelOfLife',
    question: 'Fill in the Wheel of Life',
    type: 'wheelOfLife',
    interval: 'quarterly',
    category: 'wheelOfLife',
    tense: 'future'
  },
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
    interval: params.interval ?? 'yearly',
    tense: params.tense ?? 'past'
  }
}

export function createSelfReflectQuestionConfig(params: Partial<SelfReflectQuestionConfig> = {}): SelfReflectQuestionConfig {
  return {
    key: params.key ?? '',
    category: params.category ?? 'other',
    question: params.question ?? '',
    type: params.type ?? 'textarea',
    tense: params.tense ?? 'past',
    interval: params.interval ?? 'yearly'
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
  config: SelfReflectQuestionConfig[],
  dearFutureSelfAdvice?: string
  dearFutureSelfPrediction?: string
  dearFutureSelfAnythingElse?: string
  environmentPast?: string[]
  environmentFuture?: string[]
  explorePast?: string[]
  exploreFuture?: string[]
  forgive?: string[]
  gratitude?: string[]
  imagineFuture?: string
  imagineDie?: string
  interval: SelfReflectInterval
  learnPast?: string[]
  learnFuture?: string[]
  priorities?: string[]
  proud?: string[]
  timeManagementPast?: string[]
  timeManagementFutureMoreTime?: string[]
  timeManagementFutureLessTime?: string[]
  wheelOfLife?: WheelOfLife
  createdAt: Date
  updatedAt: Date
  [key: string]: string | string[] | undefined | WheelOfLife | Date | SelfReflectQuestionConfig[] // needs to have all possible types
}

export function createSelfReflectEntry(params: Partial<SelfReflectEntry> = {}): SelfReflectEntry {
  return {
    ...params,
    config: params.config ?? [],
    interval: params.interval ?? 'weekly',
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