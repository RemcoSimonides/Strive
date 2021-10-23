export enum enumExercises {
  affirmations,
  bucketlist,
  dear_future_self,
  daily_gratefulness,
  assess_life
}

export const exercises = [
  {
    enum: enumExercises.affirmations,
    title: 'Affirmations',
    image: 'affirmations.jpg',
  },
  {
    enum: enumExercises.bucketlist,
    title: 'Bucket List',
    image: 'bucketlist.jpg'
  },
  {
    enum: enumExercises.daily_gratefulness,
    title: 'Daily Gratefulness',
    image: 'daily_gratefulness.jpg' 
  },
  {
    enum: enumExercises.dear_future_self,
    title: 'Dear Future Self',
    image: 'dear_future_self.jpg'
  },
  {
    enum: enumExercises.assess_life,
    title: 'Assess Life',
    image: 'assess_life_man.jpg'
  }
]

export type Exercises = typeof exercises;