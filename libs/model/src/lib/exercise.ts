export type ExerciseType = 'Affirmations' | 'DailyGratitude' | 'DearFutureSelf' | 'AssessLife' | 'WheelOfLife'

export interface Exercise {
	id: ExerciseType
	title: string
	image: string
	link: string
	description: string
}

export const exercises: Exercise[] = [
	{
		id: 'Affirmations',
		title: 'Affirmations',
		image: 'exercise_affirmations.png',
		link: '/exercise/affirmations',
		description: 'Control your thoughts by regularly repeating short, powerful statements'
	},
	{
		id: 'AssessLife',
		title: 'Assess Life',
		image: 'exercise_review_and_plan.png',
		link: '/exercise/assess-life',
		description: 'Get a grasp on life by looking back and planning ahead'
	},
	{
		id: 'DailyGratitude',
		title: 'Daily Gratitude',
		image: 'exercise_daily_gratitude.png',
		link: '/exercise/daily-gratitude',
		description: 'A daily practice that helps you to focus on the positive over the negative'
	},
	{
		id: 'DearFutureSelf',
		title: 'Dear Future Self',
		image: 'exercise_dear_future_self.png',
		link: '/exercise/dear-future-self',
		description: 'Write a message to yourself in the (far) future'
	},
	{
		id: 'WheelOfLife',
		title: 'Wheel of Life',
		image: 'exercise_wheel_of_life.png',
		link: '/exercise/wheel-of-life',
		description: 'Get insight in which areas in your life needs more attention'
	}
]