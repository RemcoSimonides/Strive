import { createGoalLink, Goal, GoalLink } from './goal'
import { createUserLink, User, UserLink } from './user'

export interface Comment {
  id: string
  text: string
  source: CommentSource
  createdAt: Date
  updatedAt: Date
}

export interface CommentSource {
  user: UserLink
  goal: GoalLink
}

export function createComment(params: Partial<Comment> = {}): Comment {
  return {
    id: '',
    text: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...params,
    source: createCommentSource(params?.source),
  }
}

export function createCommentSource(params: {
  goal?: GoalLink | Goal,
  user?: UserLink | User
} = {}): CommentSource {
  const source: CommentSource = {
    goal: createGoalLink(params?.goal),
    user: createUserLink(params?.user)
  }

  return source
}