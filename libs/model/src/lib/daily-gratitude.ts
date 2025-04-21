export interface DailyGratitude {
  id?: string
  on: boolean
  time: Date
  createdAt: Date
  updatedAt: Date
}

export function createDailyGratitude(data: Partial<DailyGratitude> = {}): DailyGratitude {
  return {
    id: data.id || undefined,
    on: data.on || false,
    time: data.time || new Date(),
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  }
}

export interface DailyGratitudeEntry {
  id: string,
  items: string[]
  createdAt?: Date,
  updatedAt?: Date,
}
