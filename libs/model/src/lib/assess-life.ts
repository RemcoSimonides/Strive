export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type WeekdayWithNever = Weekday | 'never'
export type AssessLifeInterval = 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type AssessLifeIntervalWithNever = AssessLifeInterval | 'never'
export type AssessLifeType = 'formlist' | 'textarea' | 'prioritizeGoals' | 'wheelOfLife'

export function getInterval(value: AssessLifeInterval): string {
  switch (value) {
    case 'weekly': return 'week'
    case 'monthly': return 'month'
    case 'quarterly': return 'quarter'
    case 'yearly': return 'year'
    default: return ''
  }
}

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
] as const
export type Setting = typeof settings[number]

export const assessLifeSteps = [
  'intro',
  'previousIntention',
  'listQuestionsPast',
  'wheelOfLife',
  'forgive',
  'listQuestionsFuture',
  'prioritizeGoals',
  'imagine',
  'dearFutureSelf',
  'custom',
  'outro'
] as const
export type Step = typeof assessLifeSteps[number]

export interface AssessLifeQuestion {
  key: string
  step: Step
  question: string
  type: AssessLifeType,
  interval: AssessLifeIntervalWithNever,
  setting: Setting
}

export const assessLifeQuestions: AssessLifeQuestion[] = [
  {
    key: 'dearFutureSelfAdvice',
    step: 'dearFutureSelf',
    question: 'What advice would you give yourself in one {interval}?',
    type: 'textarea',
    interval: 'yearly',
    setting: 'dearFutureSelf'
  },
  {
    key: 'dearFutureSelfPrediction',
    step: 'dearFutureSelf',
    question: 'What predictions do you make what will happen upcoming {interval}?',
    type: 'textarea',
    interval: 'yearly',
    setting: 'dearFutureSelf'
  },
  {
    key: 'dearFutureSelfAnythingElse',
    step: 'dearFutureSelf',
    question: 'Anything else you would like to mention?',
    type: 'textarea',
    interval: 'yearly',
    setting: 'dearFutureSelf'
  },
  {
    key: 'environmentPast',
    step: 'listQuestionsPast',
    question: 'What did you do past {interval} to leave the world in a better shape than you found it?',
    type: 'formlist',
    interval: 'monthly',
    setting: 'environment'
  },
  {
    key: 'environmentFuture',
    step: 'listQuestionsFuture',
    question: 'What do you want to explore upcoming {interval}?',
    type: 'formlist',
    interval: 'monthly',
    setting: 'environment'
  },
  {
    key: 'explorePast',
    step: 'listQuestionsPast',
    question: 'What did you explore past {interval}?',
    type: 'formlist',
    interval: 'quarterly',
    setting: 'explore'
  },
  {
    key: 'exploreFuture',
    step: 'listQuestionsFuture',
    question: 'What do you want to explore upcoming {interval}?',
    type: 'formlist',
    interval: 'quarterly',
    setting: 'explore'
  },
  {
    key: 'forgive',
    step: 'forgive',
    question: 'Did anything happen during the past {interval} that needs to be forgiven or let go of?',
    type: 'formlist',
    interval: 'monthly',
    setting: 'forgive'
  },
  {
    key: 'gratitude',
    step: 'listQuestionsPast',
    question: 'What are you grateful for past {interval}?',
    type: 'formlist',
    interval: 'weekly',
    setting: 'gratitude'
  },
  {
    key: 'imagineFuture',
    step: 'imagine',
    question: 'Imagine yourself 5 years in the future. What would your life look like?',
    type: 'textarea',
    interval: 'yearly',
    setting: 'imagine'
  },
  {
    key: 'imagineDie',
    step: 'imagine',
    question: 'What would you do in the next 5 years if you were to die right after those years?',
    type: 'textarea',
    interval: 'yearly',
    setting: 'imagine'
  },
  {
    key: 'learnFuture',
    step: 'listQuestionsFuture',
    question: 'What do you want to learn upcoming {interval}?',
    type: 'formlist',
    interval: 'weekly',
    setting: 'learn'
  },
  {
    key: 'learnPast',
    step: 'listQuestionsPast',
    question: 'What did you learn past {interval}?',
    type: 'formlist',
    interval: 'weekly',
    setting: 'learn'
  },
  {
    key: 'prioritizeGoals',
    step: 'prioritizeGoals',
    question: '',
    type: 'prioritizeGoals',
    interval: 'monthly',
    setting: 'prioritizeGoals'
  },
  {
    key: 'pride',
    step: 'listQuestionsPast',
    question: 'What are you proud of past {interval}?',
    type: 'formlist',
    interval: 'weekly',
    setting: 'pride'
  },
  {
    key: 'timeManagementFutureMoreTime',
    step: 'listQuestionsFuture',
    question: 'What will you spend more time on upcoming {interval}?',
    type: 'formlist',
    interval: 'weekly',
    setting: 'timeManagement'
  },
  {
    key: 'timeManagementFutureLessTime',
    step: 'listQuestionsFuture',
    question: 'What will you spend less time on upcoming {interval}?',
    type: 'formlist',
    interval: 'weekly',
    setting: 'timeManagement'
  },
  {
    key: 'timeManagementPast',
    step: 'listQuestionsPast',
    question: 'What did you spend too much time on past {interval}?',
    type: 'formlist',
    interval: 'weekly',
    setting: 'timeManagement'
  },
    {
    key: 'wheelOfLife',
    step: 'wheelOfLife',
    question: '',
    type: 'wheelOfLife',
    interval: 'quarterly',
    setting: 'wheelOfLife'
  },
]

export const assessLifeSettings: AssessLifeSettings = {
  preferredDay: 'sunday',
  preferredTime: '19:00',
  questions: assessLifeQuestions,
  createdAt: new Date(),
  updatedAt: new Date()
}

export function createAssessLifeQuestion(params: Partial<AssessLifeQuestion> = {}): AssessLifeQuestion {
  return {
    key: params.key ?? 'dearFutureSelfAdvice',
    step: params.step ?? 'intro',
    question: params.question ?? '',
    type: params.type ?? 'textarea',
    interval: params.interval ?? 'yearly',
    setting: params.setting ?? 'dearFutureSelf',
  }
}


export interface AssessLifeSettings {
  id?: string
  questions: AssessLifeQuestion[]
  preferredDay: WeekdayWithNever,
  preferredTime: string,
  createdAt: Date
  updatedAt: Date
}

export function createAssessLifeSettings(params: Partial<AssessLifeSettings> = {}): AssessLifeSettings {
  return {
    ...params,
    id: params.id ?? '',
    questions: params.questions ? params.questions.map(createAssessLifeQuestion) : [],
    preferredDay: params.preferredDay ?? 'sunday',
    preferredTime: params.preferredTime ?? '19:00',
    createdAt: params.createdAt ?? new Date(),
    updatedAt: params.updatedAt ?? new Date()
  }
}

export interface AssessLifeEntry {
  id?: string
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
  interval: AssessLifeInterval
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
}

export function createAssessLifeEntry(params: Partial<AssessLifeEntry> = {}): AssessLifeEntry {
  return {
    ...params,
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