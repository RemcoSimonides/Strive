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
                image: 'theo-magnet-square.svg',
                link: '/exercise/affirmations'
	},
	{
                id: 'daily_gratefulness',
                title: 'Daily Gratefulness',
                image: 'theo-meditate-square.svg',
                link: '/exercise/daily-gratefulness'
	},
	{
                id: 'dear_future_self',
                title: 'Dear Future Self',
                image: 'theo-contract-square.svg',
                link: '/exercise/dear-future-self'
	},
	{
                id: 'assess_life',
                title: 'Assess Life',
                image: 'theo-search-square.svg',
                link: '/exercise/assess-life'
        }
]