export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type WeekdayWithNever = Weekday | 'never'
export type SelfReflectInterval = 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type SelfReflectIntervalWithNever = SelfReflectInterval | 'never'
export type SelfReflectType = 'formlist' | 'textarea' | 'prioritizeGoals' | 'wheelOfLife'
export type SelfReflectTense = 'future' | 'present' | 'past'

export interface EntryStep {
  step: Step
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


/**
 * These are the settings that affect the questions provided by Strive Journal
 * Change the interval of the setting, changes the intervals of all the questions connected to this setting.
 * For custom question, the interval can be adjusted manually.
 */
export const settings = [
  'dearFutureSelf',
  'environment',
  'explore',
  'forgive',
  'gratitude',
  'imagine',
  'learn',
  'pride',
  'prioritizeGoals',
  'timeManagement',
  'wheelOfLife',
  'custom'
] as const
export type Setting = typeof settings[number]

export const selfReflectCategories = [
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
  'other'
] as const
export type SelfReflectCategory = typeof selfReflectCategories[number]

export const selfReflectSteps = [
  'intro',
  'previousIntention',
  'listQuestions',
  'wheelOfLife',
  'prioritizeGoals',
  'dearFutureSelf',
  'imagine',
  'forgive',
  'outro',
] as const

export const allSteps = [
  ...selfReflectSteps,
  ...selfReflectCategories
] as const
export type Step = typeof allSteps[number]

export interface SelfReflectQuestion {
  key: string
  step: Step
  question: string
  type: SelfReflectType
  interval: SelfReflectIntervalWithNever
  setting: Setting
  tense: SelfReflectTense
}

export type SelfReflectQuestionConfig = Omit<SelfReflectQuestion, 'setting'>

export const selfReflectQuestions: SelfReflectQuestion[] = [
  {
    key: 'dearFutureSelfAdvice',
    step: 'dearFutureSelf',
    question: 'What advice would you give yourself in one {interval}?',
    type: 'textarea',
    interval: 'yearly',
    setting: 'dearFutureSelf',
    tense: 'future'
  },
  {
    key: 'dearFutureSelfPrediction',
    step: 'dearFutureSelf',
    question: 'What predictions do you make what will happen upcoming {interval}?',
    type: 'textarea',
    interval: 'yearly',
    setting: 'dearFutureSelf',
    tense: 'future'
  },
  {
    key: 'dearFutureSelfAnythingElse',
    step: 'dearFutureSelf',
    question: 'Anything else you would like to mention?',
    type: 'textarea',
    interval: 'yearly',
    setting: 'dearFutureSelf',
    tense: 'future'
  },
  {
    key: 'environmentPast',
    step: 'listQuestions',
    question: 'What did you do past {interval} to leave the world in a better shape than you found it?',
    type: 'formlist',
    interval: 'monthly',
    setting: 'environment',
    tense: 'past'
  },
  {
    key: 'environmentFuture',
    step: 'listQuestions',
    question: 'What do you want to explore upcoming {interval}?',
    type: 'formlist',
    interval: 'monthly',
    setting: 'environment',
    tense: 'future'
  },
  {
    key: 'explorePast',
    step: 'listQuestions',
    question: 'What did you explore past {interval}?',
    type: 'formlist',
    interval: 'quarterly',
    setting: 'explore',
    tense: 'past'
  },
  {
    key: 'exploreFuture',
    step: 'listQuestions',
    question: 'What do you want to explore upcoming {interval}?',
    type: 'formlist',
    interval: 'quarterly',
    setting: 'explore',
    tense: 'future'
  },
  {
    key: 'forgive',
    step: 'forgive',
    question: 'Did anything happen during the past {interval} that needs to be forgiven or let go of?',
    type: 'formlist',
    interval: 'monthly',
    setting: 'forgive',
    tense: 'past'
  },
  {
    key: 'gratitude',
    step: 'listQuestions',
    question: 'What are you grateful for past {interval}?',
    type: 'formlist',
    interval: 'weekly',
    setting: 'gratitude',
    tense: 'past'
  },
  {
    key: 'imagineFuture',
    step: 'imagine',
    question: 'Imagine yourself 5 years in the future. What would your life look like?',
    type: 'textarea',
    interval: 'yearly',
    setting: 'imagine',
    tense: 'future'
  },
  {
    key: 'imagineDie',
    step: 'imagine',
    question: 'What would you do in the next 5 years if you were to die right after those years?',
    type: 'textarea',
    interval: 'yearly',
    setting: 'imagine',
    tense: 'future'
  },
  {
    key: 'learnFuture',
    step: 'listQuestions',
    question: 'What do you want to learn upcoming {interval}?',
    type: 'formlist',
    interval: 'weekly',
    setting: 'learn',
    tense: 'future'
  },
  {
    key: 'learnPast',
    step: 'listQuestions',
    question: 'What did you learn past {interval}?',
    type: 'formlist',
    interval: 'weekly',
    setting: 'learn',
    tense: 'past'
  },
  {
    key: 'prioritizeGoals',
    step: 'prioritizeGoals',
    question: '',
    type: 'prioritizeGoals',
    interval: 'monthly',
    setting: 'prioritizeGoals',
    tense: 'future'
  },
  {
    key: 'pride',
    step: 'listQuestions',
    question: 'What are you proud of past {interval}?',
    type: 'formlist',
    interval: 'weekly',
    setting: 'pride',
    tense: 'past'
  },
  {
    key: 'timeManagementFutureMoreTime',
    step: 'listQuestions',
    question: 'What will you spend more time on upcoming {interval}?',
    type: 'formlist',
    interval: 'weekly',
    setting: 'timeManagement',
    tense: 'future'
  },
  {
    key: 'timeManagementFutureLessTime',
    step: 'listQuestions',
    question: 'What will you spend less time on upcoming {interval}?',
    type: 'formlist',
    interval: 'weekly',
    setting: 'timeManagement',
    tense: 'future'
  },
  {
    key: 'timeManagementPast',
    step: 'listQuestions',
    question: 'What did you spend too much time on past {interval}?',
    type: 'formlist',
    interval: 'weekly',
    setting: 'timeManagement',
    tense: 'past'
  },
    {
    key: 'wheelOfLife',
    step: 'wheelOfLife',
    question: '',
    type: 'wheelOfLife',
    interval: 'quarterly',
    setting: 'wheelOfLife',
    tense: 'future'
  },
]

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
    step: params.step ?? 'intro',
    question: params.question ?? '',
    type: params.type ?? 'textarea',
    interval: params.interval ?? 'yearly',
    setting: params.setting ?? 'custom',
    tense: params.tense ?? 'past'
  }
}

export function createSelfReflectQuestionConfig(params: Partial<SelfReflectQuestionConfig> = {}): SelfReflectQuestionConfig {
  return {
    key: params.key ?? '',
    step: params.step ?? 'intro',
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