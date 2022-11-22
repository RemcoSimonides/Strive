export type Interval = 'never' | 'weekly' | 'monthly' | 'monthly' | 'quarterly' | 'yearly'

export interface WheelOfLifeSettings {
  id?: string
  interval: Interval
  createdAt: Date
  updatedAt: Date
}

export const aspects = [
  'career',
  'development',
  'environment',
  'family',
  'friends',
  'fun',
  'health',
  'love',
  'money',
  'spirituality'
] as const
export type Aspect = typeof aspects[number]
export interface AspectConfig {
  id: Aspect
  title: string
  subtitle: string
}

export interface WheelOfLifeEntry<T extends number | string>{
  id?: string
  career: T
  development: T
  environment: T
  family: T
  friends: T
  fun: T
  health: T
  love: T
  money: T
  spirituality: T
  desired_career: T
  desired_development: T
  desired_environment: T
  desired_family: T
  desired_friends: T
  desired_fun: T
  desired_health: T
  desired_love: T
  desired_money: T
  desired_spirituality: T
  createdAt: Date
  updatedAt: Date
}

export const aspectsConfig: AspectConfig[] = [
  {
    id: 'health',
    title: 'Health',
    subtitle: 'Physical health, emotional health, diet, sleep, relaxation, exercise'
  },
  {
    id: 'family',
    title: 'Family',
    subtitle: 'Quality of relationship, healthy communication, mutual understanding, time & support'
  },
  {
    id: 'friends',
    title: 'Social & Friends',
    subtitle: 'Satisfying relationship with others, like minded friends, social contribution'
  },
  {
    id: 'love',
    title: 'Love & Romance',
    subtitle: 'Love you feel in your life, vibrant life also when you are single'
  },
  {
    id: 'career',
    title: 'Career',
    subtitle: 'Purpose, success, growth, achievement'
  },
  {
    id: 'money',
    title: 'Finance',
    subtitle: 'Income, saving, budget, investment'
  },
  {
    id: 'fun',
    title: 'Fun & Recreation',
    subtitle: 'Adventure, humor, hobbies, interest outside of works'
  },
  {
    id: 'development',
    title: 'Personal Development',
    subtitle: 'Education, confidence, learning'
  },
  {
    id: 'environment',
    title: 'Physical Environment',
    subtitle: 'Pleasant, stimulating, safe'
  },
  {
    id: 'spirituality',
    title: 'Spirituality',
    subtitle: 'Connection with inner self and outer world'
  }
]