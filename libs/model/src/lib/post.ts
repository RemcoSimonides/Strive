export interface Post {
  id?: string
  description: string
  mediaURL: string
  url: string
  youtubeId?: string
  goalId: string
  uid: string
  milestoneId?: string // link to milestone
  date: Date
  updatedAt?: Date
  createdAt?: Date
}

/** A factory function that creates a PostDocument. */
export function createPost(params: Partial<Post> = {}): Post {
  return {
    description: '',
    mediaURL: '',
    url: '',
    goalId: '',
    uid: '',
    youtubeId: '',
    date: new Date(),
    ...params
  }
}