import axios from 'axios';

const SIGNIN_PATH = '/api/auth/signin';
const REFRESH_SKEW_SECONDS = 60;

interface SigninResponse {
  access_token: string;
  organization_id?: string;
  tenant_id?: number;
  user_id?: number;
}

interface CachedAuth {
  token: string;
  organizationId?: string;
  expiresAt: number | null;
  fromOverride: boolean;
}

let cached: CachedAuth | null = null;
let inflight: Promise<CachedAuth> | null = null;

function decodeJwtExp(token: string): number | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

function isExpiringSoon(auth: CachedAuth): boolean {
  if (auth.expiresAt === null) return false;
  return Date.now() / 1000 >= auth.expiresAt - REFRESH_SKEW_SECONDS;
}

async function signin(): Promise<CachedAuth> {
  const baseUrl = process.env.API_BASE_URL;
  const email = process.env.BIGCAPITAL_EMAIL;
  const password = process.env.BIGCAPITAL_PASSWORD;
  if (!baseUrl) throw new Error('API_BASE_URL is not set; cannot sign in.');
  if (!email || !password) {
    throw new Error(
      'BIGCAPITAL_EMAIL and BIGCAPITAL_PASSWORD must be set to auto-refresh the JWT ' +
        '(or provide a static BIGCAPITAL_BEARER_TOKEN).',
    );
  }
  const resp = await axios.post<SigninResponse>(
    `${baseUrl}${SIGNIN_PATH}`,
    { email, password },
    { headers: { 'Content-Type': 'application/json' }, validateStatus: () => true },
  );
  if (resp.status >= 400 || !resp.data?.access_token) {
    const body = typeof resp.data === 'object' ? JSON.stringify(resp.data) : String(resp.data);
    throw new Error(`Signin failed (${resp.status}): ${body}`);
  }
  const token = resp.data.access_token;
  const exp = decodeJwtExp(token);
  const orgFromEnv = process.env.BIGCAPITAL_ORGANIZATION_ID;
  return {
    token,
    organizationId: orgFromEnv || resp.data.organization_id,
    expiresAt: exp,
    fromOverride: false,
  };
}

async function load(force: boolean): Promise<CachedAuth> {
  if (!force && cached && (cached.fromOverride || !isExpiringSoon(cached))) {
    return cached;
  }

  const staticToken = process.env.BIGCAPITAL_BEARER_TOKEN;
  const haveCreds = !!(process.env.BIGCAPITAL_EMAIL && process.env.BIGCAPITAL_PASSWORD);

  if (staticToken && !haveCreds) {
    cached = {
      token: staticToken,
      organizationId: process.env.BIGCAPITAL_ORGANIZATION_ID,
      expiresAt: decodeJwtExp(staticToken),
      fromOverride: true,
    };
    return cached;
  }

  if (inflight) return inflight;
  inflight = signin()
    .then((auth) => {
      cached = auth;
      return auth;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const auth = await load(false);
  const headers: Record<string, string> = { authorization: `Bearer ${auth.token}` };
  if (auth.organizationId) headers['organization-id'] = auth.organizationId;
  return headers;
}

export async function forceRefresh(): Promise<void> {
  if (cached?.fromOverride && !(process.env.BIGCAPITAL_EMAIL && process.env.BIGCAPITAL_PASSWORD)) {
    throw new Error(
      'Got 401 but BIGCAPITAL_BEARER_TOKEN is in use without email/password — cannot auto-refresh. ' +
        'Set BIGCAPITAL_EMAIL/BIGCAPITAL_PASSWORD or rotate the static token.',
    );
  }
  await load(true);
}
