import { ListEntries, createListEntries } from './form-utils'

export type AssessLifeInterval = 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type AssessLifeIntervalWithNever = AssessLifeInterval | 'never'

export interface AssessLifeSettings {
  id?: string
  dearFutureSelf: AssessLifeIntervalWithNever
  environment: AssessLifeIntervalWithNever
  explore: AssessLifeIntervalWithNever
  gratitude: AssessLifeIntervalWithNever
  learn: AssessLifeIntervalWithNever
  prioritizeGoals: AssessLifeIntervalWithNever
  proud: AssessLifeIntervalWithNever
  timeManagement: AssessLifeIntervalWithNever
  wheelOfLife: AssessLifeIntervalWithNever
  createdAt: Date
  updatedAt: Date
}

export function createAssessLifeSettings(params: Partial<AssessLifeSettings> = {}): AssessLifeSettings {
  return {
    ...params,
    id: params.id ?? '',
    dearFutureSelf: params.dearFutureSelf ?? 'yearly',
    environment: params.environment ?? 'quarterly',
    explore: params.explore ?? 'quarterly',
    gratitude: params.gratitude ?? 'weekly',
    learn: params.learn ?? 'weekly',
    prioritizeGoals: params.prioritizeGoals ?? 'monthly',
    proud: params.proud ?? 'weekly',
    timeManagement: params.timeManagement ?? 'weekly',
    wheelOfLife: params.wheelOfLife ?? 'quarterly',
    createdAt: params.createdAt ?? new Date(),
    updatedAt: params.updatedAt ?? new Date()
  }
}

export interface AssessLifeEntry {
  id?: string
  dearFutureSelf: AssessLifeDearFutureSelf
  environment: AssessLifeEnvironment
  explore: AssessLifeExplore
  interval: AssessLifeInterval
  gratitude: ListEntries
  learn: Learn
  proud: ListEntries
  timeManagement: TimeManagement
  wheelOfLife: WheelOfLife
  createdAt: Date
  updatedAt: Date
}

export function createAssessLifeEntry(params: Partial<AssessLifeEntry> = {}): AssessLifeEntry {
  return {
    ...params,
    interval: params.interval ?? 'weekly',
    createdAt: params.createdAt ?? new Date(),
    updatedAt: params.updatedAt ?? new Date(),
    dearFutureSelf: createAssessLifeDearFutureSelf(params?.dearFutureSelf),
    environment: createAssessLifeEnvironment(params?.environment),
    explore: createAssessLifeExplore(params?.explore),
    gratitude: createListEntries(params?.gratitude),
    learn: createLearn(params?.learn),
    proud: createListEntries(params?.proud),
    timeManagement: createTimeManagement(params?.timeManagement),
    wheelOfLife: createWheelOfLife(params?.wheelOfLife)
  }
}

export interface AssessLifeDearFutureSelf {
  advice: string
  predictions: string
  anythingElse: string
}

export function createAssessLifeDearFutureSelf(params?: Partial<AssessLifeDearFutureSelf>): AssessLifeDearFutureSelf {
  return {
    advice: params?.advice ?? '',
    predictions: params?.predictions ?? '',
    anythingElse: params?.anythingElse ?? ''
  }
}

export interface AssessLifeEnvironment {
  past: ListEntries
  future: ListEntries
}

export function createAssessLifeEnvironment(params?: Partial<AssessLifeEnvironment>): AssessLifeEnvironment {
  return {
    past: createListEntries(params?.past),
    future: createListEntries(params?.future)
  }
}

export interface AssessLifeExplore {
  past: ListEntries
  future: ListEntries
}

export function createAssessLifeExplore(params?: Partial<AssessLifeExplore>): AssessLifeExplore {
  return {
    past: createListEntries(params?.past),
    future: createListEntries(params?.future)
  }
}

export interface Learn {
  past: ListEntries
  future: ListEntries
}

export function createLearn(params?: Partial<Learn>): Learn {
  return {
    past: createListEntries(params?.past),
    future: createListEntries(params?.future)
  }
}

export interface TimeManagement {
  past: ListEntries
  futureMoreTime: ListEntries
  futureLessTime: ListEntries
}

export function createTimeManagement(params?: Partial<TimeManagement>): TimeManagement {
  return {
    past: createListEntries(params?.past),
    futureMoreTime: createListEntries(params?.futureMoreTime),
    futureLessTime: createListEntries(params?.futureLessTime)
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
    career: params?.career ?? 0,
    development: params?.development ?? 0,
    environment: params?.environment ?? 0,
    family: params?.family ?? 0,
    friends: params?.friends ?? 0,
    fun: params?.fun ?? 0,
    health: params?.health ?? 0,
    love: params?.love ?? 0,
    money: params?.money ?? 0,
    spirituality: params?.spirituality ?? 0
  }
}