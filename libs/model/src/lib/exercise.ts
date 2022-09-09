export type ExerciseType = 'dear_future_self' | 'daily_gratefulness' | 'assess_life' | 'affirmations'

export interface Exercise {
	id: ExerciseType
	title: string
	image: string
	link: string
} 

export const exercises: Exercise[] = [
	{
    id: 'affirmations',
    title: 'Affirmations',
    image: 'affirmations.jpeg',
    link: '/exercise/affirmations'
	},
	{
    id: 'daily_gratefulness',
    title: 'Daily Gratefulness',
    image: 'daily_gratefulness.jpeg',
    link: '/exercise/daily-gratefulness'
	},
	{
    id: 'dear_future_self',
    title: 'Dear Future Self',
    image: 'dear_future_self.jpeg',
    link: '/exercise/dear-future-self'
	},
	{
    id: 'assess_life',
    title: 'Assess Life',
    image: 'assess_life_man.jpeg',
    link: '/exercise/assess-life'
	}
]