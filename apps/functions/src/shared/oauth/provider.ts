import { Response } from 'express'
import { randomBytes, createHash } from 'crypto'
import { db, auth, logger } from '@strive/api/firebase'
import { OAuthRegisteredClientsStore } from '@modelcontextprotocol/sdk/server/auth/clients.js'
import { OAuthServerProvider, AuthorizationParams } from '@modelcontextprotocol/sdk/server/auth/provider.js'
import { OAuthClientInformationFull, OAuthTokens, OAuthTokenRevocationRequest } from '@modelcontextprotocol/sdk/shared/auth.js'
import { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js'
import { InvalidGrantError } from '@modelcontextprotocol/sdk/server/auth/errors.js'
import { getAuthorizePage } from './authorize-page'

// ---------------------------------------------------------------------------
// Firestore collections
// ---------------------------------------------------------------------------
const CLIENTS_COL = 'OAuthClients'
const AUTH_CODES_COL = 'OAuthAuthCodes'
const TOKENS_COL = 'OAuthTokens'

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------
function generateToken(): string {
  return randomBytes(32).toString('hex')
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

const ACCESS_TOKEN_TTL = 3600 // 1 hour in seconds
const REFRESH_TOKEN_TTL = 30 * 24 * 3600 // 30 days in seconds

// ---------------------------------------------------------------------------
// Clients store (Firestore-backed)
// ---------------------------------------------------------------------------
class FirestoreClientsStore implements OAuthRegisteredClientsStore {
  async getClient(clientId: string): Promise<OAuthClientInformationFull | undefined> {
    const doc = await db.doc(`${CLIENTS_COL}/${clientId}`).get()
    if (!doc.exists) return undefined
    return doc.data() as OAuthClientInformationFull
  }

  async registerClient(client: Omit<OAuthClientInformationFull, 'client_id' | 'client_id_issued_at'>): Promise<OAuthClientInformationFull> {
    // Use the SDK-provided client_id/secret if present, otherwise generate
    const fullClient = { ...client } as OAuthClientInformationFull
    if (!fullClient.client_id) {
      fullClient.client_id = randomBytes(16).toString('hex')
    }
    if (!fullClient.client_id_issued_at) {
      fullClient.client_id_issued_at = Math.floor(Date.now() / 1000)
    }

    // Serialize URL objects to strings for Firestore compatibility
    if (fullClient.redirect_uris) {
      fullClient.redirect_uris = fullClient.redirect_uris.map((u: any) =>
        typeof u === 'string' ? u : u.toString()
      ) as any
    }

    // Remove undefined values (Firestore rejects them)
    const firestoreData: Record<string, any> = {}
    for (const [key, value] of Object.entries(fullClient)) {
      if (value !== undefined) firestoreData[key] = value
    }

    await db.doc(`${CLIENTS_COL}/${fullClient.client_id}`).set(firestoreData)
    return fullClient
  }
}

// ---------------------------------------------------------------------------
// OAuth Server Provider (Firebase Auth backed)
// ---------------------------------------------------------------------------
export class StriveOAuthProvider implements OAuthServerProvider {
  private _clientsStore = new FirestoreClientsStore()
  private _baseUrl: string

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl
  }

  get clientsStore(): OAuthRegisteredClientsStore {
    return this._clientsStore
  }

  /**
   * Renders the authorization/login page.
   * The page uses Firebase Auth JS SDK to sign in the user,
   * then POSTs the Firebase ID token to /oauth/callback which
   * creates an auth code and redirects.
   */
  async authorize(
    client: OAuthClientInformationFull,
    params: AuthorizationParams,
    res: Response
  ): Promise<void> {
    const html = getAuthorizePage({
      clientId: client.client_id,
      clientName: client.client_name || 'MCP Client',
      redirectUri: params.redirectUri,
      state: params.state,
      codeChallenge: params.codeChallenge,
      scopes: params.scopes || [],
      callbackUrl: `${this._baseUrl}/oauth/callback`,
    })

    res.setHeader('Content-Type', 'text/html')
    res.send(html)
  }

  /**
   * Returns the PKCE code challenge that was stored with the authorization code.
   */
  async challengeForAuthorizationCode(
    _client: OAuthClientInformationFull,
    authorizationCode: string
  ): Promise<string> {
    try {
      const hashedCode = hashToken(authorizationCode)
      logger.log('challengeForAuthorizationCode: looking up code hash', hashedCode.slice(0, 8))
      const doc = await db.doc(`${AUTH_CODES_COL}/${hashedCode}`).get()

      if (!doc.exists) {
        logger.warn('challengeForAuthorizationCode: code not found')
        throw new InvalidGrantError('Invalid authorization code')
      }

      const data = doc.data()!
      logger.log('challengeForAuthorizationCode: found code, returning challenge')
      return data.codeChallenge
    } catch (e: any) {
      logger.error('challengeForAuthorizationCode error:', e.message, e.stack)
      throw e
    }
  }

  /**
   * Exchanges an authorization code for access + refresh tokens.
   */
  async exchangeAuthorizationCode(
    _client: OAuthClientInformationFull,
    authorizationCode: string
  ): Promise<OAuthTokens> {
    try {
    const hashedCode = hashToken(authorizationCode)
    logger.log('exchangeAuthorizationCode: looking up code hash', hashedCode.slice(0, 8))
    const codeDoc = await db.doc(`${AUTH_CODES_COL}/${hashedCode}`).get()

    if (!codeDoc.exists) throw new InvalidGrantError('Invalid authorization code')

    const codeData = codeDoc.data()!

    // Check expiry (codes are valid for 5 minutes)
    if (Date.now() > codeData.expiresAt) {
      await codeDoc.ref.delete()
      throw new InvalidGrantError('Authorization code has expired')
    }

    // Delete the code (one-time use)
    await codeDoc.ref.delete()

    // Issue tokens
    const accessToken = generateToken()
    const refreshToken = generateToken()
    const now = Math.floor(Date.now() / 1000)

    const tokenData = {
      uid: codeData.uid,
      clientId: codeData.clientId,
      scopes: codeData.scopes,
      accessTokenHash: hashToken(accessToken),
      refreshTokenHash: hashToken(refreshToken),
      accessTokenExpiresAt: now + ACCESS_TOKEN_TTL,
      refreshTokenExpiresAt: now + REFRESH_TOKEN_TTL,
      createdAt: now,
    }

    await db.collection(TOKENS_COL).add(tokenData)

    logger.log('exchangeAuthorizationCode: tokens issued for uid', codeData.uid)
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_TTL,
      scope: codeData.scopes.join(' '),
    }
    } catch (e: any) {
      logger.error('exchangeAuthorizationCode error:', e.message, e.stack)
      throw e
    }
  }

  /**
   * Exchanges a refresh token for a new access token.
   */
  async exchangeRefreshToken(
    _client: OAuthClientInformationFull,
    refreshToken: string,
    scopes?: string[]
  ): Promise<OAuthTokens> {
    const hashedRefresh = hashToken(refreshToken)

    const snap = await db.collection(TOKENS_COL)
      .where('refreshTokenHash', '==', hashedRefresh)
      .limit(1)
      .get()

    if (snap.empty) throw new InvalidGrantError('Invalid refresh token')

    const doc = snap.docs[0]
    const tokenData = doc.data()

    const now = Math.floor(Date.now() / 1000)
    if (now > tokenData.refreshTokenExpiresAt) {
      await doc.ref.delete()
      throw new InvalidGrantError('Refresh token has expired')
    }

    // Issue new access token (keep same refresh token)
    const newAccessToken = generateToken()
    const newRefreshToken = generateToken()

    await doc.ref.update({
      accessTokenHash: hashToken(newAccessToken),
      refreshTokenHash: hashToken(newRefreshToken),
      accessTokenExpiresAt: now + ACCESS_TOKEN_TTL,
    })

    const grantedScopes = scopes && scopes.length > 0 ? scopes : tokenData.scopes

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_TTL,
      scope: grantedScopes.join(' '),
    }
  }

  /**
   * Verifies an access token and returns auth info.
   */
  async verifyAccessToken(token: string): Promise<AuthInfo> {
    const hashedToken = hashToken(token)

    const snap = await db.collection(TOKENS_COL)
      .where('accessTokenHash', '==', hashedToken)
      .limit(1)
      .get()

    if (snap.empty) throw new InvalidGrantError('Invalid access token')

    const tokenData = snap.docs[0].data()
    const now = Math.floor(Date.now() / 1000)

    if (now > tokenData.accessTokenExpiresAt) {
      throw new InvalidGrantError('Access token has expired')
    }

    return {
      token,
      clientId: tokenData.clientId,
      scopes: tokenData.scopes,
      expiresAt: tokenData.accessTokenExpiresAt,
      extra: { uid: tokenData.uid },
    }
  }

  /**
   * Revokes an access or refresh token.
   */
  async revokeToken(
    _client: OAuthClientInformationFull,
    request: OAuthTokenRevocationRequest
  ): Promise<void> {
    const hashedToken = hashToken(request.token)

    // Try matching as access token
    let snap = await db.collection(TOKENS_COL)
      .where('accessTokenHash', '==', hashedToken)
      .limit(1)
      .get()

    if (!snap.empty) {
      await snap.docs[0].ref.delete()
      return
    }

    // Try matching as refresh token
    snap = await db.collection(TOKENS_COL)
      .where('refreshTokenHash', '==', hashedToken)
      .limit(1)
      .get()

    if (!snap.empty) {
      await snap.docs[0].ref.delete()
    }
  }

  // ---------------------------------------------------------------------------
  // Auth code creation (called from /oauth/callback endpoint)
  // ---------------------------------------------------------------------------
  async createAuthorizationCode(params: {
    uid: string
    clientId: string
    redirectUri: string
    codeChallenge: string
    state?: string
    scopes: string[]
  }): Promise<string> {
    const code = generateToken()
    const hashedCode = hashToken(code)

    await db.doc(`${AUTH_CODES_COL}/${hashedCode}`).set({
      uid: params.uid,
      clientId: params.clientId,
      redirectUri: params.redirectUri,
      codeChallenge: params.codeChallenge,
      state: params.state || '',
      scopes: params.scopes,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      createdAt: Date.now(),
    })

    return code
  }
}
