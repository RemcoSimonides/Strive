import fetch from 'node-fetch'
import { logger } from '@strive/api/firebase'
import { Post } from '@strive/model'

interface CreatePostParams {
  description: string
  date: string
  url?: string
  externalId?: string
  source?: string
}

interface ApiResponse<T> {
  data: T
}

interface ApiErrorResponse {
  error: string
}

export interface StriveApiClient {
  createPost(goalId: string, post: CreatePostParams): Promise<{ post: Post, status: number }>
}

export function createStriveApiClient(apiKey: string): StriveApiClient {
  const baseUrl = process.env['API_BASE_URL'] || 'https://api.strivejournal.com'

  async function request<T>(method: string, path: string, body?: unknown): Promise<{ data: T, status: number }> {
    const url = `${baseUrl}/v1${path}`
    logger.log(`Strive API ${method} ${url}`)

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorBody = await response.text()
      let errorMessage: string
      try {
        const parsed = JSON.parse(errorBody) as ApiErrorResponse
        errorMessage = parsed.error || errorBody
      } catch {
        errorMessage = errorBody
      }

      const err = new Error(`Strive API error ${response.status}: ${errorMessage}`) as Error & { status: number }
      err.status = response.status
      throw err
    }

    const result = await response.json() as ApiResponse<T>
    return { data: result.data, status: response.status }
  }

  return {
    async createPost(goalId: string, post: CreatePostParams): Promise<{ post: Post, status: number }> {
      const { data, status } = await request<Post>('POST', `/goals/${goalId}/posts`, post)
      return { post: data, status }
    }
  }
}
