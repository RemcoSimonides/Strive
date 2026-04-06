import express from 'express'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { mcpAuthRouter } from '@modelcontextprotocol/sdk/server/auth/router.js'
import { onRequest } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { auth, logger } from '@strive/api/firebase'
import { StriveOAuthProvider } from '../shared/oauth/provider'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const BASE_URL = 'https://strive-journal.web.app'
const API_BASE = 'https://api.strivejournal.com/v1'
const ALL_SCOPES = [
  'goals:read', 'goals:write',
  'milestones:read', 'milestones:write',
  'posts:read', 'posts:write',
  'reminders:read', 'reminders:write',
]

// ---------------------------------------------------------------------------
// REST API client — thin wrapper around fetch
// ---------------------------------------------------------------------------
class StriveApiClient {
  constructor(private authHeader: string) {}

  private async request(method: string, path: string, body?: unknown): Promise<{ ok: boolean; status: number; data: any }> {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const json = await res.json() as any
    return { ok: res.ok, status: res.status, data: json.data ?? json }
  }

  // Goals
  listGoals() { return this.request('GET', '/goals') }
  getGoal(goalId: string) { return this.request('GET', `/goals/${goalId}`) }
  createGoal(body: any) { return this.request('POST', '/goals', body) }
  updateGoal(goalId: string, body: any) { return this.request('PATCH', `/goals/${goalId}`, body) }

  // Milestones
  listMilestones(goalId: string) { return this.request('GET', `/goals/${goalId}/milestones`) }
  createMilestone(goalId: string, body: any) { return this.request('POST', `/goals/${goalId}/milestones`, body) }
  updateMilestone(goalId: string, milestoneId: string, body: any) { return this.request('PATCH', `/goals/${goalId}/milestones/${milestoneId}`, body) }
  deleteMilestone(goalId: string, milestoneId: string) { return this.request('DELETE', `/goals/${goalId}/milestones/${milestoneId}`) }

  // Posts
  listPosts(goalId: string, limit?: number) { return this.request('GET', `/goals/${goalId}/posts${limit ? `?limit=${limit}` : ''}`) }
  createPost(goalId: string, body: any) { return this.request('POST', `/goals/${goalId}/posts`, body) }
  updatePost(goalId: string, postId: string, body: any) { return this.request('PATCH', `/goals/${goalId}/posts/${postId}`, body) }
  deletePost(goalId: string, postId: string) { return this.request('DELETE', `/goals/${goalId}/posts/${postId}`) }

  // Reminders
  listReminders(goalId: string) { return this.request('GET', `/goals/${goalId}/reminders`) }
  createReminder(goalId: string, body: any) { return this.request('POST', `/goals/${goalId}/reminders`, body) }
  updateReminder(goalId: string, reminderId: string, body: any) { return this.request('PATCH', `/goals/${goalId}/reminders/${reminderId}`, body) }
  deleteReminder(goalId: string, reminderId: string) { return this.request('DELETE', `/goals/${goalId}/reminders/${reminderId}`) }
}

// ---------------------------------------------------------------------------
// Tool helpers
// ---------------------------------------------------------------------------
function toolError(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true }
}

function toolResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
}

function apiResult(res: { ok: boolean; data: any }) {
  return res.ok ? toolResult(res.data) : toolError(res.data?.error || 'Request failed')
}

// ---------------------------------------------------------------------------
// MCP server factory — creates a fresh server with tools that call REST API
// ---------------------------------------------------------------------------
function createMcpServerWithTools(api: StriveApiClient) {
  const mcp = new McpServer({
    name: 'strive',
    version: '1.0.0',
  })

  // =========================================================================
  // GOALS
  // =========================================================================

  mcp.registerTool(
    'list_goals',
    { description: 'List all goals where you are a stakeholder' },
    async () => apiResult(await api.listGoals())
  )

  mcp.registerTool(
    'get_goal',
    {
      description: 'Get a single goal by ID',
      inputSchema: { goalId: z.string().describe('The goal ID') },
    },
    async ({ goalId }) => apiResult(await api.getGoal(goalId))
  )

  mcp.registerTool(
    'create_goal',
    {
      description: 'Create a new goal',
      inputSchema: {
        title: z.string().describe('Goal title'),
        description: z.string().optional().describe('Goal description'),
        deadline: z.string().optional().describe('Deadline as ISO 8601 date string'),
        publicity: z.enum(['public', 'private']).optional().describe('Goal visibility (default: private)'),
      },
    },
    async (args) => apiResult(await api.createGoal(args))
  )

  mcp.registerTool(
    'update_goal',
    {
      description: 'Update an existing goal',
      inputSchema: {
        goalId: z.string().describe('The goal ID'),
        title: z.string().optional().describe('New title'),
        description: z.string().optional().describe('New description'),
        deadline: z.string().optional().describe('New deadline as ISO 8601 date string'),
        status: z.enum(['pending', 'succeeded', 'failed']).optional().describe('Goal status'),
        publicity: z.enum(['public', 'private']).optional().describe('Goal visibility'),
      },
    },
    async ({ goalId, ...fields }) => apiResult(await api.updateGoal(goalId, fields))
  )

  // =========================================================================
  // MILESTONES
  // =========================================================================

  mcp.registerTool(
    'list_milestones',
    {
      description: 'List milestones for a goal',
      inputSchema: { goalId: z.string().describe('The goal ID') },
    },
    async ({ goalId }) => apiResult(await api.listMilestones(goalId))
  )

  mcp.registerTool(
    'create_milestone',
    {
      description: 'Create a milestone for a goal',
      inputSchema: {
        goalId: z.string().describe('The goal ID'),
        content: z.string().describe('Milestone title/content'),
        description: z.string().optional().describe('Milestone description'),
        deadline: z.string().optional().describe('Deadline as ISO 8601 date string'),
        order: z.number().optional().describe('Display order (0-based)'),
        subtasks: z.array(z.object({
          content: z.string().describe('Subtask text'),
          completed: z.boolean().optional().describe('Whether completed (default: false)'),
        })).optional().describe('List of subtasks'),
      },
    },
    async ({ goalId, ...body }) => apiResult(await api.createMilestone(goalId, body))
  )

  mcp.registerTool(
    'update_milestone',
    {
      description: 'Update an existing milestone',
      inputSchema: {
        goalId: z.string().describe('The goal ID'),
        milestoneId: z.string().describe('The milestone ID'),
        content: z.string().optional().describe('New title/content'),
        description: z.string().optional().describe('New description'),
        deadline: z.string().optional().describe('New deadline as ISO 8601 date string'),
        status: z.enum(['pending', 'succeeded', 'failed']).optional().describe('Milestone status'),
        order: z.number().optional().describe('Display order'),
        subtasks: z.array(z.object({
          content: z.string(),
          completed: z.boolean().optional(),
        })).optional().describe('Replace subtasks list'),
      },
    },
    async ({ goalId, milestoneId, ...body }) => apiResult(await api.updateMilestone(goalId, milestoneId, body))
  )

  mcp.registerTool(
    'delete_milestone',
    {
      description: 'Soft-delete a milestone',
      inputSchema: {
        goalId: z.string().describe('The goal ID'),
        milestoneId: z.string().describe('The milestone ID'),
      },
      annotations: { destructiveHint: true },
    },
    async ({ goalId, milestoneId }) => apiResult(await api.deleteMilestone(goalId, milestoneId))
  )

  // =========================================================================
  // POSTS
  // =========================================================================

  mcp.registerTool(
    'list_posts',
    {
      description: 'List posts (story updates) for a goal',
      inputSchema: {
        goalId: z.string().describe('The goal ID'),
        limit: z.number().optional().describe('Max posts to return (1-100, default 50)'),
      },
    },
    async ({ goalId, limit }) => apiResult(await api.listPosts(goalId, limit))
  )

  mcp.registerTool(
    'create_post',
    {
      description: 'Create a story post (progress update) for a goal',
      inputSchema: {
        goalId: z.string().describe('The goal ID'),
        description: z.string().describe('Post content/description'),
        date: z.string().optional().describe('Post date as ISO 8601 string (default: now)'),
        url: z.string().optional().describe('Optional URL to include'),
        milestoneId: z.string().optional().describe('Optional milestone to link this post to'),
      },
    },
    async ({ goalId, ...body }) => apiResult(await api.createPost(goalId, body))
  )

  mcp.registerTool(
    'update_post',
    {
      description: 'Update an existing post',
      inputSchema: {
        goalId: z.string().describe('The goal ID'),
        postId: z.string().describe('The post ID'),
        description: z.string().optional().describe('New content/description'),
        date: z.string().optional().describe('New date as ISO 8601 string'),
        url: z.string().optional().describe('New URL'),
        milestoneId: z.string().optional().describe('New milestone link'),
      },
    },
    async ({ goalId, postId, ...body }) => apiResult(await api.updatePost(goalId, postId, body))
  )

  mcp.registerTool(
    'delete_post',
    {
      description: 'Delete a post',
      inputSchema: {
        goalId: z.string().describe('The goal ID'),
        postId: z.string().describe('The post ID'),
      },
      annotations: { destructiveHint: true },
    },
    async ({ goalId, postId }) => apiResult(await api.deletePost(goalId, postId))
  )

  // =========================================================================
  // REMINDERS
  // =========================================================================

  mcp.registerTool(
    'list_reminders',
    {
      description: 'List your reminders for a goal',
      inputSchema: { goalId: z.string().describe('The goal ID') },
    },
    async ({ goalId }) => apiResult(await api.listReminders(goalId))
  )

  mcp.registerTool(
    'create_reminder',
    {
      description: 'Create a reminder for a goal',
      inputSchema: {
        goalId: z.string().describe('The goal ID'),
        description: z.string().optional().describe('Reminder description'),
        interval: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'never']).optional().describe('Recurrence interval (default: weekly)'),
        isRepeating: z.boolean().optional().describe('Whether the reminder repeats (default: true)'),
        date: z.string().optional().describe('Reminder date/time as ISO 8601 string'),
        dayOfWeek: z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']).optional().describe('Day of week for weekly/monthly reminders'),
        numberOfWeek: z.number().optional().describe('Week number for monthly/quarterly intervals'),
      },
    },
    async ({ goalId, ...body }) => apiResult(await api.createReminder(goalId, body))
  )

  mcp.registerTool(
    'update_reminder',
    {
      description: 'Update an existing reminder',
      inputSchema: {
        goalId: z.string().describe('The goal ID'),
        reminderId: z.string().describe('The reminder ID'),
        description: z.string().optional().describe('New description'),
        interval: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'never']).optional(),
        isRepeating: z.boolean().optional(),
        date: z.string().optional().describe('New date/time as ISO 8601 string'),
        dayOfWeek: z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']).optional(),
        numberOfWeek: z.number().optional(),
      },
    },
    async ({ goalId, reminderId, ...body }) => apiResult(await api.updateReminder(goalId, reminderId, body))
  )

  mcp.registerTool(
    'delete_reminder',
    {
      description: 'Delete a reminder',
      inputSchema: {
        goalId: z.string().describe('The goal ID'),
        reminderId: z.string().describe('The reminder ID'),
      },
      annotations: { destructiveHint: true },
    },
    async ({ goalId, reminderId }) => apiResult(await api.deleteReminder(goalId, reminderId))
  )

  return mcp
}

// ---------------------------------------------------------------------------
// OAuth provider
// ---------------------------------------------------------------------------
const oauthProvider = new StriveOAuthProvider(BASE_URL)

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express()
app.set('trust proxy', 1)


// OAuth routes (/.well-known/*, /oauth/authorize, /oauth/token, etc.)
app.use(mcpAuthRouter({
  provider: oauthProvider,
  issuerUrl: new URL(BASE_URL),
  resourceServerUrl: new URL(`${BASE_URL}/mcp`),
  scopesSupported: ALL_SCOPES,
  resourceName: 'Strive Journal',
  serviceDocumentationUrl: new URL('https://strivejournal.com'),
}))

// OAuth callback — receives Firebase ID token, creates auth code, redirects
app.post('/oauth/callback', express.json(), async (req, res) => {
  try {
    const { idToken, clientId, redirectUri, state, codeChallenge, scopes } = req.body

    if (!idToken || !clientId || !redirectUri || !codeChallenge) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const decodedToken = await auth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    const client = await oauthProvider.clientsStore.getClient(clientId)
    if (!client) {
      res.status(400).json({ error: 'Invalid client_id' })
      return
    }

    const grantedScopes = Array.isArray(scopes) && scopes.length > 0
      ? scopes.filter((s: string) => ALL_SCOPES.includes(s))
      : ALL_SCOPES

    const code = await oauthProvider.createAuthorizationCode({
      uid,
      clientId,
      redirectUri,
      codeChallenge,
      state,
      scopes: grantedScopes,
    })

    const redirectUrl = new URL(redirectUri)
    redirectUrl.searchParams.set('code', code)
    if (state) redirectUrl.searchParams.set('state', state)

    res.json({ redirectUrl: redirectUrl.toString() })
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Internal server error' })
  }
})

// ---------------------------------------------------------------------------
// MCP Streamable HTTP endpoint
// ---------------------------------------------------------------------------
app.post('/mcp', async (req, res) => {
  const authHeader = req.headers.authorization as string | undefined
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized. Provide a Bearer token (API key or OAuth access token).' })
    return
  }

  // Create API client that forwards the auth header to the REST API
  const api = new StriveApiClient(authHeader)

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  })

  const mcp = createMcpServerWithTools(api)
  await mcp.connect(transport)

  await transport.handleRequest(req, res, req.body)
})

app.get('/mcp', (_req, res) => {
  res.writeHead(405).end(JSON.stringify({ error: 'Method not allowed. Use POST for stateless MCP.' }))
})

app.delete('/mcp', (_req, res) => {
  res.writeHead(405).end(JSON.stringify({ error: 'Method not allowed. Sessions are not used.' }))
})

app.get('/status', (_req, res) => {
  res.json({ status: 'ok', service: 'strive-mcp', timestamp: new Date().toISOString() })
})

// Debug endpoint: simulates the OAuth flow step by step
app.get('/debug/oauth-flow', async (_req, res) => {
  const results: Record<string, any> = {}
  const baseUrl = `https://mcpserver-5dkwldatwa-uc.a.run.app`

  try {
    // Step 1: PRM
    const prmRes = await fetch(`${baseUrl}/.well-known/oauth-protected-resource/mcp`)
    results.prm = { status: prmRes.status, body: await prmRes.json() }

    // Step 2: AS metadata
    const asRes = await fetch(`${baseUrl}/.well-known/oauth-authorization-server`)
    results.asMetadata = { status: asRes.status, body: await asRes.json() }

    // Step 3: Register
    const regRes = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        redirect_uris: ['http://127.0.0.1:9999/callback'],
        client_name: 'debug-flow-test',
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        token_endpoint_auth_method: 'client_secret_post',
      }),
    })
    const regBody = await regRes.json() as any
    results.register = { status: regRes.status, body: regBody }

    // Step 4: Token exchange with fake code (should get invalid_grant, NOT server_error)
    const tokenRes = await fetch(`${baseUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: 'fakecode',
        code_verifier: 'testverifier',
        client_id: regBody.client_id,
        client_secret: regBody.client_secret,
        redirect_uri: 'http://127.0.0.1:9999/callback',
      }).toString(),
    })
    results.token = { status: tokenRes.status, body: await tokenRes.json() }

    // Step 5: Test refresh token with fake token
    const refreshRes = await fetch(`${baseUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: 'faketoken',
        client_id: regBody.client_id,
        client_secret: regBody.client_secret,
      }).toString(),
    })
    results.refresh = { status: refreshRes.status, body: await refreshRes.json() }

    res.json(results)
  } catch (e: any) {
    res.json({ ...results, error: e.message, stack: e.stack })
  }
})


// Global error handler — log uncaught Express errors
app.use((err: any, _req: any, res: any, _next: any) => {
  logger.error('MCP Express error:', err?.message || err, err?.stack)
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export const mcpServer = onRequest({ cors: true, region: 'us-central1' }, app)
