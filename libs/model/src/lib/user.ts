export interface User {
  uid: string
  username: string
  photoURL: string
  numberOfSpectating: number
  numberOfSpectators: number
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
    ...params
  }
}

export interface AlgoliaUser {
  objectID?: string
  uid: string
  username: string
  photoURL: string
  numberOfSpectators: number
}


export function createAlgoliaUser(params: AlgoliaUser | User): AlgoliaUser {
  return {
    objectID: params.uid,
    uid: params.uid,
    username: params.username,
    photoURL: params.photoURL,
    numberOfSpectators: params.numberOfSpectators
  }
}