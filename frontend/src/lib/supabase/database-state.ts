import type { SupabaseClient, User as SupabaseAuthUser } from "@supabase/supabase-js";
import { defaultState } from "@/lib/mock-data";
import {
  Article,
  Business,
  EmiState,
  ExportLog,
  Profile,
  ReportNote,
  StockItem,
  Transaction,
  User
} from "@/lib/types";

type DbResult = { error: { message: string } | null };

function appUserFromSupabase(user: SupabaseAuthUser): User {
  return {
    id: user.id,
    name: String(user.user_metadata?.name ?? user.email ?? "Pemilik UMKM"),
    email: user.email ?? "",
    password: ""
  };
}

export function blankWorkspaceState(user: User, profile?: Partial<Profile>): EmiState {
  return {
    ...JSON.parse(JSON.stringify(defaultState)),
    session: { isLoggedIn: true, userId: user.id },
    users: [user],
    profile: {
      owner: profile?.owner ?? user.name,
      business: profile?.business ?? String(profile?.business || user.name ? `UMKM ${user.name}` : "Workspace UMKM Baru"),
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

function assertOk(result: DbResult, label: string) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
}

function dateOnly(value: string | null | undefined) {
  return (value ?? new Date().toISOString()).slice(0, 10);
}


export async function loadPublicDatabaseState(client: SupabaseClient): Promise<EmiState> {
  const state = { ...JSON.parse(JSON.stringify(defaultState)), session: { isLoggedIn: false, userId: null } } as EmiState;

  const [articlesResult, businessesResult] = await Promise.all([
    client.from("articles").select("*").eq("status", "Terbit").order("published_at", { ascending: false }),
    client.from("businesses").select("*").order("created_at", { ascending: false })
  ]);

  assertOk(articlesResult, "Muat artikel publik");
  assertOk(businessesResult, "Muat UMKM publik");

  state.articles = (articlesResult.data ?? []).map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    excerpt: row.excerpt,
    body: row.body,
    author: row.author || "Pelaku UMKM",
    date: dateOnly(row.published_at ?? row.created_at),
    status: row.status,
    cover: row.cover_url,
    readMinutes: Number(row.read_minutes),
    ownerId: row.user_id
  })) as Article[];

  state.businesses = (businessesResult.data ?? []).map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    distance: Number(row.distance),
    phone: row.phone,
    promo: row.promo,
    image: row.image_url,
    ownerId: row.user_id
  })) as Business[];

  return state;
}
export async function ensureDatabaseProfile(client: SupabaseClient, user: SupabaseAuthUser, profile?: Partial<Profile>) {
  const localUser = appUserFromSupabase(user);
  const fallback = blankWorkspaceState(localUser, profile).profile;
  const payload = {
    id: user.id,
    owner: profile?.owner ?? fallback.owner,
    business: profile?.business ?? String(user.user_metadata?.business ?? fallback.business),
    category: profile?.category ?? fallback.category,
    city: profile?.city ?? fallback.city,
    address: profile?.address ?? fallback.address,
    phone: profile?.phone ?? fallback.phone,
    promo: profile?.promo ?? fallback.promo,
    promo_radius: profile?.promoRadius ?? fallback.promoRadius,
    promo_active: profile?.promoActive ?? fallback.promoActive,
    updated_at: new Date().toISOString()
  };

  assertOk(await client.from("profiles").upsert(payload), "Simpan profil UMKM");
}

export async function loadDatabaseState(client: SupabaseClient, authUser: SupabaseAuthUser): Promise<EmiState> {
  const localUser = appUserFromSupabase(authUser);

  const profileResult = await client.from("profiles").select("*").eq("id", authUser.id).maybeSingle();
  if (profileResult.error) throw new Error(`Muat profil UMKM: ${profileResult.error.message}`);

  if (!profileResult.data) {
    await ensureDatabaseProfile(client, authUser);
  }

  const [profileReload, transactionsResult, stocksResult, articlesResult, businessesResult, notesResult, exportLogsResult] = await Promise.all([
    client.from("profiles").select("*").eq("id", authUser.id).maybeSingle(),
    client.from("transactions").select("*").eq("user_id", authUser.id).order("date", { ascending: false }),
    client.from("stocks").select("*").eq("user_id", authUser.id).order("updated_at", { ascending: false }),
    client.from("articles").select("*").eq("user_id", authUser.id).order("updated_at", { ascending: false }),
    client.from("businesses").select("*").order("created_at", { ascending: false }),
    client.from("report_notes").select("*").eq("user_id", authUser.id).order("updated_at", { ascending: false }),
    client.from("export_logs").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false })
  ]);

  for (const [label, result] of [
    ["Muat profil UMKM", profileReload],
    ["Muat transaksi", transactionsResult],
    ["Muat stok", stocksResult],
    ["Muat artikel", articlesResult],
    ["Muat data UMKM", businessesResult],
    ["Muat report notes", notesResult],
    ["Muat log ekspor", exportLogsResult]
  ] as Array<[string, DbResult]>) {
    assertOk(result, label);
  }

  const profileRow = profileReload.data;
  const state = blankWorkspaceState(localUser, {
    owner: profileRow?.owner,
    business: profileRow?.business,
    category: profileRow?.category,
    city: profileRow?.city,
    address: profileRow?.address,
    phone: profileRow?.phone,
    promo: profileRow?.promo,
    promoRadius: profileRow?.promo_radius,
    promoActive: profileRow?.promo_active
  });

  state.transactions = (transactionsResult.data ?? []).map(row => ({
    id: row.id,
    date: dateOnly(row.date),
    type: row.type,
    category: row.category,
    amount: Number(row.amount),
    note: row.note ?? "",
    ownerId: row.user_id
  })) as Transaction[];

  state.stocks = (stocksResult.data ?? []).map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    quantity: Number(row.quantity),
    unit: row.unit,
    reorderPoint: Number(row.reorder_point),
    updatedAt: dateOnly(row.updated_at),
    ownerId: row.user_id
  })) as StockItem[];

  state.articles = (articlesResult.data ?? []).map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    excerpt: row.excerpt,
    body: row.body,
    author: row.author || state.profile.owner,
    date: dateOnly(row.published_at ?? row.created_at),
    status: row.status,
    cover: row.cover_url,
    readMinutes: Number(row.read_minutes),
    ownerId: row.user_id
  })) as Article[];

  state.businesses = (businessesResult.data ?? []).map(row => ({
    id: row.id,
    name: row.name,
    category: row.category,
    distance: Number(row.distance),
    phone: row.phone,
    promo: row.promo,
    image: row.image_url,
    ownerId: row.user_id
  })) as Business[];

  state.reportNotes = (notesResult.data ?? []).map(row => ({
    id: row.id,
    businessId: row.business_id,
    title: row.title,
    body: row.body,
    status: row.status,
    priority: row.priority,
    author: row.author,
    createdAt: dateOnly(row.created_on),
    updatedAt: dateOnly(row.updated_on),
    ownerId: row.user_id
  })) as ReportNote[];

  state.exportLogs = (exportLogsResult.data ?? []).map(row => ({
    id: row.id,
    type: row.type,
    fileName: row.file_name,
    createdAt: dateOnly(row.created_on),
    ownerId: row.user_id
  })) as ExportLog[];

  return state;
}

type OwnedEntity = { id: string; ownerId?: string | null };

function rowsOwnedByWorkspace<T extends OwnedEntity>(rows: T[], userId: string) {
  return rows.filter(item => item.ownerId === userId || typeof item.ownerId === "undefined");
}

async function syncOwnedRows(
  client: SupabaseClient,
  table: string,
  userId: string,
  rows: Array<Record<string, unknown> & { id: string }>
) {
  if (rows.length > 0) {
    assertOk(await client.from(table).upsert(rows, { onConflict: "id" }), `Simpan tabel ${table}`);
  }

  let deleteQuery = client.from(table).delete().eq("user_id", userId);
  if (rows.length > 0) {
    deleteQuery = deleteQuery.not("id", "in", `(${rows.map(item => item.id).join(",")})`);
  }

  assertOk(await deleteQuery, `Bersihkan data lama ${table}`);
}

export async function saveDatabaseState(client: SupabaseClient, state: EmiState, userId: string) {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const profile = state.profile;

  await ensureDatabaseProfile(client, { id: userId, email: state.users[0]?.email, user_metadata: { name: profile.owner } } as unknown as SupabaseAuthUser, profile);

  const ownBusinesses = rowsOwnedByWorkspace(state.businesses, userId);
  const ownTransactions = rowsOwnedByWorkspace(state.transactions, userId);
  const ownStocks = rowsOwnedByWorkspace(state.stocks, userId);
  const ownArticles = rowsOwnedByWorkspace(state.articles, userId);
  const ownReportNotes = rowsOwnedByWorkspace(state.reportNotes, userId);
  const ownExportLogs = rowsOwnedByWorkspace(state.exportLogs, userId);

  await syncOwnedRows(client, "businesses", userId, ownBusinesses.map(item => ({
    id: item.id,
    user_id: userId,
    name: item.name,
    category: item.category,
    distance: item.distance,
    phone: item.phone,
    promo: item.promo,
    image_url: item.image,
    updated_at: now
  })));

  await syncOwnedRows(client, "transactions", userId, ownTransactions.map(item => ({
    id: item.id,
    user_id: userId,
    date: item.date,
    type: item.type,
    category: item.category,
    amount: item.amount,
    note: item.note,
    updated_at: now
  })));

  await syncOwnedRows(client, "stocks", userId, ownStocks.map(item => ({
    id: item.id,
    user_id: userId,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    reorder_point: item.reorderPoint,
    updated_at: item.updatedAt || today
  })));

  await syncOwnedRows(client, "articles", userId, ownArticles.map(item => ({
    id: item.id,
    user_id: userId,
    slug: item.slug,
    title: item.title,
    category: item.category,
    excerpt: item.excerpt,
    body: item.body,
    author: item.author,
    cover_url: item.cover,
    status: item.status,
    read_minutes: item.readMinutes,
    published_at: item.status === "Terbit" ? item.date : null,
    updated_at: now
  })));

  await syncOwnedRows(client, "report_notes", userId, ownReportNotes.map(item => ({
    id: item.id,
    user_id: userId,
    business_id: item.businessId,
    title: item.title,
    body: item.body,
    status: item.status,
    priority: item.priority,
    author: item.author,
    created_on: item.createdAt,
    updated_on: item.updatedAt,
    updated_at: now
  })));

  await syncOwnedRows(client, "export_logs", userId, ownExportLogs.map(item => ({
    id: item.id,
    user_id: userId,
    type: item.type,
    file_name: item.fileName,
    created_on: item.createdAt
  })));
}