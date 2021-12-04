export enum enumExercises {
  dear_future_self = 'dear_future_self',
  daily_gratefulness = 'daily_gratefulness',
  assess_life = 'assess_life',
  affirmations = 'affirmations'
}

export const exercises = [
  {
    enum: enumExercises.affirmations,
    title: 'Affirmations',
    image: 'affirmations.jpeg',
  },
  {
    enum: enumExercises.daily_gratefulness,
    title: 'Daily Gratefulness',
    image: 'daily_gratefulness.jpeg'
  },
  {
    enum: enumExercises.dear_future_self,
    title: 'Dear Future Self',
    image: 'dear_future_self.jpeg'
  },
  {
    enum: enumExercises.assess_life,
    title: 'Assess Life',
    image: 'assess_life_man.jpeg'
  }
]

export type Exercises = typeof exercises;