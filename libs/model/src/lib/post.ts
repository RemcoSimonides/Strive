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
  stravaActivityId?: number
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
    stravaActivityId: 0,
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...params
  }
}

export interface SendIntentPost {
  title?: string
  type?: string
  url?: string
  [key: string]: any
}