export type ApiKeyScope =
  | 'goals:read'
  | 'goals:write'
  | 'milestones:read'
  | 'milestones:write'
  | 'user:read'
  | 'posts:read'
  | 'supports:read'

export interface ApiKey {
  id: string
  uid: string
  name: string
  prefix: string
  hashedKey: string
  scopes: ApiKeyScope[]
  lastUsedAt?: Date
  expiresAt?: Date
  revoked: boolean
  createdAt?: Date
  updatedAt?: Date
}

export function createApiKey(params: Partial<ApiKey> = {}): ApiKey {
  return {
    id: '',
    uid: '',
    name: '',
    prefix: '',
    hashedKey: '',
    scopes: [],
    revoked: false,
    ...params
  }
}
