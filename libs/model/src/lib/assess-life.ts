import { createListEntries } from './form-utils'

export type AssessLifeInterval = 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type AssessLifeIntervalWithNever = AssessLifeInterval | 'never'

export interface AssessLifeSettings {
  id?: string
  timeManagement: AssessLifeIntervalWithNever
  wheelOfLife: AssessLifeIntervalWithNever
  createdAt: Date
  updatedAt: Date
}

export function createAssessLifeSettings(params: Partial<AssessLifeSettings> = {}): AssessLifeSettings {
  return {
    ...params,
    id: params.id ?? '',
    timeManagement: params.timeManagement ?? 'weekly',
    wheelOfLife: params.wheelOfLife ?? 'weekly',
    createdAt: params.createdAt ?? new Date(),
    updatedAt: params.updatedAt ?? new Date()
  }
}

export interface AssessLifeEntry {
  id?: string
  interval: AssessLifeInterval
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
    timeManagement: createTimeManagement(params?.timeManagement),
    wheelOfLife: createWheelOfLife(params?.wheelOfLife)
  }
}

export interface TimeManagement {
  past: {
    entries: string[]
  }
  futureMoreTime: {
    entries: string[]
  }
  futureLessTime: {
    entries: string[]
  }
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