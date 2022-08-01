export interface User {
  uid: string
  username: string
  photoURL: string
  numberOfSpectating: number
  numberOfSpectators: number
  numberOfActiveGoals: number
  updatedAt?: Date
  createdAt?: Date
}

export function createUser(params: Partial<User> = {}): User {
  return {
    uid: '',
    username: '',
    photoURL: '',
    numberOfSpectating: 0,
    numberOfSpectators: 0,
    numberOfActiveGoals: 0,
    ...params
  }
}

export interface UserLink {
  uid: string
  username: string
  photoURL: string
}

export function createUserLink(params: Partial<UserLink | User> = {}): UserLink {
  return {
    uid: params.uid ?? '',
    username: params.username ?? '',
    photoURL: params.photoURL ?? ''
  }
}