export interface Features {
	features: Feature[]
}

export interface Feature {
	header: string
	description: string
	url: string
	createdAt: Date
}