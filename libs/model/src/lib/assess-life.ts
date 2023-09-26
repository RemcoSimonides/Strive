import { createListEntries } from './form-utils'

export type AssessLifeInterval = 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type AssessLifeIntervalWithNever = AssessLifeInterval | 'never'

export interface AssessLifeSettings {
  id?: string
  timeManagement: AssessLifeIntervalWithNever
  createdAt: Date
  updatedAt: Date
}

export function createAssessLifeSettings(params: Partial<AssessLifeSettings> = {}): AssessLifeSettings {
  return {
    ...params,
    id: params.id ?? '',
    timeManagement: params.timeManagement ?? 'weekly',
    createdAt: params.createdAt ?? new Date(),
    updatedAt: params.updatedAt ?? new Date()
  }
}

export interface AssessLifeEntry {
  id?: string
  interval: AssessLifeInterval
  timeManagement: TimeManagement
  createdAt: Date
  updatedAt: Date
}

export function createAssessLifeEntry(params: Partial<AssessLifeEntry> = {}): AssessLifeEntry {
  return {
    ...params,
    interval: params.interval ?? 'weekly',
    createdAt: params.createdAt ?? new Date(),
    updatedAt: params.updatedAt ?? new Date(),
    timeManagement: createTimeManagement(params?.timeManagement)
  }
}

export interface TimeManagement {
  past: {
    entries: string[]
  }
  future: {
    entries: string[]
  }
}

export function createTimeManagement(params?: Partial<TimeManagement>): TimeManagement {
  return {
    past: createListEntries(params?.past),
    future: createListEntries(params?.future)
  }
}