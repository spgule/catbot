import axios from "axios";
import { getAutoUsers, bumpEntered } from "./db.js";
import { decrypt } from "./crypto.js";
import { sendEntryEmbed, sendSnapshotEmbed } from "./logger.js";

const API_BASE = "https://api.alphabot.app/v1";

// timing
const ENTER_DELAY_MS = 7000;          // 7s entre entries
const PAGE_DELAY_MS = 1500;           // 1.5s entre páginas
const RECENT_WINDOW_MS = 10 * 60 * 1000;

// pagination
const PAGE_SIZE = 100;

/* =========================
   STATE
========================= */

let snapshotRunning = false;
const recentlyTried = new Map(); // userId -> Map(slug -> ts)

/* =========================
   HELPERS
========================= */

function authHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function markTried(userId, slug) {
  if (!recentlyTried.has(userId)) {
    recentlyTried.set(userId, new Map());
  }
  recentlyTried.get(userId).set(slug, Date.now());
}

function wasRecentlyTried(userId, slug) {
  const last = recentlyTried.get(userId)?.get(slug);
  return last && Date.now() - last < RECENT_WINDOW_MS;
}

/* =========================
   API
========================= */

async function apiGetAllRaffles(apiKey) {
  const all = [];
  let pageNum = 0;

  while (true) {
    console.log(`[SNAPSHOT] fetching page ${pageNum}`);

    const res = await axios.get(`${API_BASE}/raffles`, {
      headers: authHeaders(apiKey),
      params: {
        filter: "unregistered",
        status: "active",
        sort: "newest",
        pageSize: PAGE_SIZE,
        pageNum,
      },
      timeout: 20000,
    });

    const raffles = res?.data?.data?.raffles || [];
    console.log(`[SNAPSHOT] page ${pageNum} -> ${raffles.length} raffles`);

    if (!raffles.length) break;

    all.push(...raffles);

    if (raffles.length < PAGE_SIZE) break;

    pageNum++;
    await new Promise(r => setTimeout(r, PAGE_DELAY_MS));
  }

  return all;
}

async function apiRegister(apiKey, slug) {
  return axios.post(
    `${API_BASE}/register`,
    { slug },
    { headers: authHeaders(apiKey), timeout: 20000 }
  );
}

/* =========================
   ENTRY
========================= */

async function tryEnter(user, slug) {
  if (wasRecentlyTried(user.id, slug)) return;

  let apiKey;
  try {
    apiKey = decrypt(user.apiKey);
  } catch {
    console.log(`[ENTRY] decrypt failed for ${user.id}`);
    return;
  }

  try {
    const res = await apiRegister(apiKey, slug);
    const body = res?.data;
    const validation = body?.data?.validation;

    // ✅ sucesso real
    if (body?.success === true && validation?.success === true) {
      bumpEntered(user.id, 1);
      markTried(user.id, slug);

      await sendEntryEmbed({
        userId: user.id,
        username: user.username || "Unknown User",
        userAvatar: user.avatar || null,
        raffleSlug: slug,
        giveawaysJoined: user.entered + 1,
        success: true,
        message: "Entry confirmed",
      });

      return;
    }

    // ❌ falha lógica
    const reason =
      validation?.reason ||
      body?.data?.resultMd ||
      "Entry not accepted";

    markTried(user.id, slug);

    await sendEntryEmbed({
      userId: user.id,
      username: user.username || "Unknown User",
      userAvatar: user.avatar || null,
      raffleSlug: slug,
      giveawaysJoined: user.entered,
      success: false,
      message: reason,
    });
  } catch (e) {
    const msg =
      e?.response?.data?.errors?.[0]?.message ||
      e?.response?.data?.message ||
      `HTTP ${e?.response?.status || "error"}`;

    await sendEntryEmbed({
      userId: user.id,
      username: user.username || "Unknown User",
      userAvatar: user.avatar || null,
      raffleSlug: slug,
      giveawaysJoined: user.entered,
      success: false,
      message: msg,
    });
  }
}

/* =========================
   SNAPSHOT LOOP
========================= */

export async function runSnapshotCycle() {
  console.log("[SNAPSHOT] cycle invoked");

  if (snapshotRunning) {
    console.log("[SNAPSHOT] already running, skip");
    return;
  }
  snapshotRunning = true;

  const users = getAutoUsers();
  console.log(`[SNAPSHOT] auto users: ${users.length}`);

  if (!users.length) {
    snapshotRunning = false;
    return;
  }

  let scanKey;
  try {
    scanKey = decrypt(users[0].apiKey);
  } catch {
    console.log("[SNAPSHOT] scan apiKey decrypt failed");
    snapshotRunning = false;
    return;
  }

  let raffles;
  try {
    raffles = await apiGetAllRaffles(scanKey);
  } catch (e) {
    console.log("[SNAPSHOT] fetch failed", e?.response?.status, e?.message);
    snapshotRunning = false;
    return;
  }

  const snapshot = [...new Set(raffles.map(r => r.slug).filter(Boolean))];
  console.log(`[SNAPSHOT] total captured: ${snapshot.length}`);

  await sendSnapshotEmbed(snapshot.length);

  for (const slug of snapshot) {
    console.log(`[QUEUE] raffle ${slug}`);

    for (const user of users) {
      await tryEnter(user, slug);
    }

    await new Promise(r => setTimeout(r, ENTER_DELAY_MS));
  }

  snapshotRunning = false;
  setImmediate(runSnapshotCycle);
}

/* =========================
   EXTERNAL TRIGGER
========================= */

export function triggerSnapshot() {
  if (!snapshotRunning) {
    console.log("[SNAPSHOT] triggered externally");
    setImmediate(runSnapshotCycle);
  }
}
