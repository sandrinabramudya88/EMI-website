import { createHash, pbkdf2Sync, randomBytes } from "crypto";
import { Pool } from "pg";
import { defaultState } from "@/lib/mock-data";
import type { EmiState, Profile, User } from "@/lib/types";

export const SESSION_COOKIE = "emi_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const PASSWORD_ITERATIONS = 120_000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = "sha256";

type UserRow = {
  id: string;
  name: string;
  email: string;
  business_name: string;
};

type SessionRow = UserRow & {
  data: EmiState | null;
};

type GlobalWithPool = typeof globalThis & {
  emiPgPool?: Pool;
  emiPgSchemaReady?: Promise<void>;
};

function getConnectionString() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

export function isRailwayDatabaseConfigured() {
  return Boolean(getConnectionString());
}

function getPool() {
  const connectionString = getConnectionString();
  if (!connectionString) throw new Error("DATABASE_URL Railway Postgres belum dikonfigurasi.");

  const globalForPool = globalThis as GlobalWithPool;
  if (!globalForPool.emiPgPool) {
    globalForPool.emiPgPool = new Pool({ connectionString });
  }

  return globalForPool.emiPgPool;
}

export async function ensureRailwaySchema() {
  const globalForPool = globalThis as GlobalWithPool;
  if (!globalForPool.emiPgSchemaReady) {
    globalForPool.emiPgSchemaReady = getPool().query(`
      create extension if not exists "pgcrypto";

      create table if not exists public.emi_users (
        id uuid primary key default gen_random_uuid(),
        name text not null,
        email text not null unique,
        password_hash text not null,
        password_salt text not null,
        business_name text not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create table if not exists public.emi_workspaces (
        user_id uuid primary key references public.emi_users(id) on delete cascade,
        data jsonb not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create table if not exists public.emi_sessions (
        token_hash text primary key,
        user_id uuid not null references public.emi_users(id) on delete cascade,
        expires_at timestamptz not null,
        created_at timestamptz not null default now()
      );

      create index if not exists emi_sessions_user_id_idx on public.emi_sessions(user_id);
      create index if not exists emi_sessions_expires_at_idx on public.emi_sessions(expires_at);
    `).then(() => undefined);
  }

  return globalForPool.emiPgSchemaReady;
}

function cloneState(state: EmiState) {
  return JSON.parse(JSON.stringify(state)) as EmiState;
}

function appUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: ""
  };
}

function blankWorkspaceState(user: User, profile?: Partial<Profile>): EmiState {
  return {
    ...cloneState(defaultState),
    session: { isLoggedIn: true, userId: user.id },
    users: [user],
    profile: {
      owner: profile?.owner ?? user.name,
      business: profile?.business ?? `UMKM ${user.name}`,
      category: profile?.category ?? "UMKM Umum",
      city: profile?.city ?? "",
      address: profile?.address ?? "",
      phone: profile?.phone ?? "",
      promo: profile?.promo ?? "Tuliskan promosi usaha Anda di sini.",
      promoRadius: profile?.promoRadius ?? 5,
      promoActive: profile?.promoActive ?? true
    },
    transactions: [],
    stocks: [],
    articles: [],
    businesses: [],
    reportNotes: [],
    exportLogs: []
  };
}

function normalizeStateForUser(data: EmiState | null | undefined, row: UserRow): EmiState {
  const user = appUser(row);
  const state = data ? { ...cloneState(defaultState), ...data } : blankWorkspaceState(user, { business: row.business_name });

  state.session = { isLoggedIn: true, userId: row.id };
  state.users = [user];
  state.transactions = Array.isArray(state.transactions) ? state.transactions : [];
  state.stocks = Array.isArray(state.stocks) ? state.stocks : [];
  state.articles = Array.isArray(state.articles) ? state.articles : [];
  state.businesses = Array.isArray(state.businesses) ? state.businesses : [];
  state.reportNotes = Array.isArray(state.reportNotes) ? state.reportNotes : [];
  state.exportLogs = Array.isArray(state.exportLogs) ? state.exportLogs : [];

  return state;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST).toString("hex");
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, expectedHash: string) {
  return hashPassword(password, salt).hash === expectedHash;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await getPool().query(
    `insert into public.emi_sessions (token_hash, user_id, expires_at)
     values ($1, $2, $3)`,
    [tokenHash, userId, expiresAt]
  );

  return token;
}

export function publicState() {
  return { ...cloneState(defaultState), session: { isLoggedIn: false, userId: null }, users: [] } satisfies EmiState;
}

export async function registerRailwayUser(input: { name: string; email: string; password: string; businessName?: string }) {
  await ensureRailwaySchema();

  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;
  const businessName = input.businessName?.trim() || `UMKM ${name}`;

  if (name.length < 2) throw new Error("Nama lengkap minimal 2 karakter.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Format email tidak valid.");
  if (password.length < 6) throw new Error("Password minimal 6 karakter.");

  const { salt, hash } = hashPassword(password);
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("begin");

    const userResult = await client.query<UserRow>(
      `insert into public.emi_users (name, email, password_hash, password_salt, business_name)
       values ($1, $2, $3, $4, $5)
       returning id, name, email, business_name`,
      [name, email, hash, salt, businessName]
    );

    const user = appUser(userResult.rows[0]);
    const state = blankWorkspaceState(user, { owner: name, business: businessName });

    await client.query(
      `insert into public.emi_workspaces (user_id, data)
       values ($1, $2::jsonb)`,
      [user.id, JSON.stringify(state)]
    );

    await client.query("commit");

    return {
      token: await createSession(user.id),
      state
    };
  } catch (error) {
    await client.query("rollback");
    if ((error as { code?: string }).code === "23505") {
      throw new Error("Email sudah terdaftar.");
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function loginRailwayUser(input: { email: string; password: string }) {
  await ensureRailwaySchema();

  const result = await getPool().query<SessionRow & { password_hash: string; password_salt: string }>(
    `select u.id, u.name, u.email, u.business_name, u.password_hash, u.password_salt, w.data
     from public.emi_users u
     left join public.emi_workspaces w on w.user_id = u.id
     where u.email = $1`,
    [normalizeEmail(input.email)]
  );

  const row = result.rows[0];
  if (!row || !verifyPassword(input.password, row.password_salt, row.password_hash)) {
    return null;
  }

  return {
    token: await createSession(row.id),
    state: normalizeStateForUser(row.data, row)
  };
}

export async function getStateFromSession(token: string | undefined) {
  await ensureRailwaySchema();
  if (!token) return null;

  const tokenHash = hashToken(token);
  await getPool().query(`delete from public.emi_sessions where expires_at <= now()`);

  const result = await getPool().query<SessionRow>(
    `select u.id, u.name, u.email, u.business_name, w.data
     from public.emi_sessions s
     join public.emi_users u on u.id = s.user_id
     left join public.emi_workspaces w on w.user_id = u.id
     where s.token_hash = $1 and s.expires_at > now()`,
    [tokenHash]
  );

  const row = result.rows[0];
  if (!row) return null;
  return normalizeStateForUser(row.data, row);
}

export async function saveStateForSession(token: string | undefined, state: EmiState) {
  await ensureRailwaySchema();
  if (!token) return false;

  const current = await getStateFromSession(token);
  if (!current?.session.userId) return false;

  const next = normalizeStateForUser(state, {
    id: current.session.userId,
    name: current.users[0]?.name ?? current.profile.owner,
    email: current.users[0]?.email ?? "",
    business_name: state.profile.business
  });

  await getPool().query(
    `insert into public.emi_workspaces (user_id, data, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (user_id) do update set data = excluded.data, updated_at = now()`,
    [current.session.userId, JSON.stringify(next)]
  );

  await getPool().query(
    `update public.emi_users
     set name = $2, business_name = $3, updated_at = now()
     where id = $1`,
    [current.session.userId, next.profile.owner, next.profile.business]
  );

  return true;
}

export async function deleteRailwaySession(token: string | undefined) {
  await ensureRailwaySchema();
  if (!token) return;
  await getPool().query(`delete from public.emi_sessions where token_hash = $1`, [hashToken(token)]);
}