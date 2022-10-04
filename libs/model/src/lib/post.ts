export interface Post {
  id?: string
  title: string
  description: string
  mediaURL: string
  url: string
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
    title: '',
    description: '',
    mediaURL: '',
    url: '',
    goalId: '',
    uid: '',
    date: new Date(),
    ...params
  }
} 