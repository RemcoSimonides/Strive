import { Media } from './media'

export interface PostBase {
  id?: string
  description: string
  mediaIds: string[]
  url: string
  youtubeId?: string
  goalId: string
  uid: string
  milestoneId?: string // link to milestone
  date: Date
  updatedAt?: Date
  createdAt?: Date
}

export interface Post extends PostBase {
  medias?: Media[]
}

/** A factory function that creates a PostDocument. */
export function createPost(params: Partial<Post> = {}): Post {
  return {
    description: '',
    mediaIds: [],
    url: '',
    goalId: '',
    uid: '',
    youtubeId: '',
    date: new Date(),
    ...params
  }
}