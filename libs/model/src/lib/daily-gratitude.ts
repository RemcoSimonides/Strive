export interface DailyGratitude {
  id?: string
  on: boolean
  time: Date
  createdAt: Date
  updatedAt: Date
}

export interface DailyGratitudeEntry {
  id: string,
  items: string[]
  createdAt?: Date,
  updatedAt?: Date,
}
