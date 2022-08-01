export interface Spectator {
  uid: string
  username: string
  photoURL: string
  isSpectator: boolean
  profileId: string
  profileUsername: string
  profilePhotoURL: string
  createdAt?: Date
  updatedAt?: Date
}

//** A factory function that creates a SpectatorDocument */
export function createSpectator(params: Partial<Spectator> = {}): Spectator {
  return {
    uid: '',
    photoURL: '',
    username: '',
    isSpectator: false,
    profileId: '',
    profilePhotoURL: '',
    profileUsername: '',
    ...params
  }
}