export type ExerciseType = 'dear_future_self' | 'daily_gratefulness' | 'wheel_of_life' | 'affirmations'

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
		id: 'wheel_of_life',
		title: 'Wheel of Life',
		image: 'wheel_of_life.jpg',
		link: '/exercise/wheel-of-life'
	}
]