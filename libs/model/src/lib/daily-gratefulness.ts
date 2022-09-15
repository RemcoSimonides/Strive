export interface DailyGratefulness {
  id?: string
  on: boolean
  time: Date
  createdAt: Date
  updatedAt: Date
}

export interface DailyGratefulnessItem {
  id: string,
  items: string[]
  createdAt: Date,
  updatedAt: Date,
}
