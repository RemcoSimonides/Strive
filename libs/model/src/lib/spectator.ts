export interface Spectator {
  uid: string
  isSpectator: boolean
  profileId: string
  createdAt: Date
  updatedAt: Date
}

//** A factory function that creates a SpectatorDocument */
export function createSpectator(params: Partial<Spectator> = {}): Spectator {
  return {
    uid: '',
    isSpectator: false,
    profileId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...params
  }
}