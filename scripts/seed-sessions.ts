import 'dotenv/config';

const API = 'http://localhost:4000/api';
const REQUEST_DELAY_MS = 30; // pausa entre requests para no saturar

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface AuthResponse {
  token: string;
  user: { id: string };
}

async function api<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Retry con backoff en 429
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(`${API}${path}`, { ...init, headers });

    if (res.status === 429 && attempt < maxAttempts) {
      const waitMs = 2000 * attempt;
      console.warn(
        `   ⏳ 429 on ${path}, retrying in ${waitMs}ms (attempt ${attempt}/${maxAttempts})`,
      );
      await sleep(waitMs);
      continue;
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `${init.method ?? 'GET'} ${path} → ${res.status}: ${body}`,
      );
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }
  throw new Error(`${init.method ?? 'GET'} ${path} → exhausted retries`);
}

async function ensureUser(
  email: string,
  password: string,
  name: string,
): Promise<string> {
  try {
    const r = await api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    console.log(`   ✅ Created user ${email}`);
    return r.token;
  } catch (err) {
    // Si el registro falla (409 email exists), probamos login
    const r = await api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    console.log(`   ✅ Logged in as ${email}`);
    return r.token;
  }
}

/** Cancela cualquier sesión huérfana que haya quedado IN_PROGRESS. */
async function cancelStaleSessions(token: string): Promise<void> {
  try {
    const { items } = await api<{ items: { id: string }[] }>(
      '/workout-sessions?status=IN_PROGRESS',
      {},
      token,
    );
    for (const s of items) {
      await api(`/workout-sessions/${s.id}/cancel`, { method: 'POST' }, token);
      console.log(`   🧹 Cancelled stale session ${s.id}`);
    }
  } catch {
    // Si el endpoint falla, seguimos — no es crítico
  }
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface Plan {
  id: string;
  name: string;
}

interface StartSessionResponse {
  session: {
    id: string;
    sessionExercises: {
      id: string;
      targetSets: number;
      targetReps: number;
      sets: { setNumber: number }[];
    }[];
  };
}

/* ------------------------------------------------------------------ */
/* Core: one session                                                   */
/* ------------------------------------------------------------------ */
async function runOneSession(
  token: string,
  planId: string,
  startedAt: Date,
  finishedAt: Date,
  weightKg: number,
): Promise<number> {
  // 1. Start
  const started = await api<StartSessionResponse>(
    '/workout-sessions/start',
    {
      method: 'POST',
      body: JSON.stringify({
        workoutPlanId: planId,
        startedAt: startedAt.toISOString(),
      }),
    },
    token,
  );
  const { session } = started;
  await sleep(REQUEST_DELAY_MS);

  // 2. Log every set of every exercise
  for (const se of session.sessionExercises) {
    for (const set of se.sets) {
      await api(
        `/workout-sessions/${session.id}/exercises/${se.id}/sets/${set.setNumber}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            weight: weightKg,
            reps: se.targetReps,
            status: 'COMPLETED',
          }),
        },
        token,
      );
      await sleep(REQUEST_DELAY_MS);
    }
  }

  // 3. Complete with backdated finishedAt
  const result = await api<{ session: { totalVolume: number } }>(
    `/workout-sessions/${session.id}/complete`,
    {
      method: 'POST',
      body: JSON.stringify({ finishedAt: finishedAt.toISOString() }),
    },
    token,
  );
  await sleep(REQUEST_DELAY_MS);

  return result.session.totalVolume;
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */
async function main(): Promise<void> {
  const email = process.env.SEED_EMAIL ?? 'demo@forgefit.dev';
  const password = process.env.SEED_PASSWORD ?? 'supersecret1';

  console.log('🔑 Authenticating...');
  const token = await ensureUser(email, password, 'Demo User');

  console.log('\n🧹 Checking for stale in-progress sessions...');
  await cancelStaleSessions(token);

  console.log('\n📋 Fetching plans...');
  const { plans } = await api<{ plans: Plan[] }>('/workout-plans', {}, token);
  const plan = plans.find((p) => p.name === 'Full Body Starter') ?? plans[0];
  if (!plan) {
    throw new Error('No plans available — run `npm run prisma:seed` first');
  }
  console.log(`   Using plan: ${plan.name}`);

  // 6 weeks back from today, one session per week, weight increasing
  const config = [
    { weeksAgo: 5, weightKg: 40 },
    { weeksAgo: 4, weightKg: 45 },
    { weeksAgo: 3, weightKg: 50 },
    { weeksAgo: 2, weightKg: 55 },
    { weeksAgo: 1, weightKg: 60 },
    { weeksAgo: 0, weightKg: 65 },
  ];

  console.log('\n🏋️  Creating sessions...\n');
  const now = new Date();
  let totalCreated = 0;

  for (const cfg of config) {
    const started = new Date(now);
    started.setDate(started.getDate() - cfg.weeksAgo * 7);
    started.setHours(18, 0, 0, 0);

    const finished = new Date(started);
    finished.setHours(19, 0, 0, 0);

    const weekLabel = started.toISOString().slice(0, 10);
    process.stdout.write(`   Week ${weekLabel} (${cfg.weightKg} kg)... `);

    try {
      const volume = await runOneSession(
        token,
        plan.id,
        started,
        finished,
        cfg.weightKg,
      );
      console.log(`✅ volume = ${volume} kg`);
      totalCreated++;
    } catch (err) {
      console.log(`❌ ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`\n✅ Created ${totalCreated} / ${config.length} sessions`);

  // Verify
  console.log('\n📊 Progress response:\n');
  const progress = await api<unknown>('/progress/overall', {}, token);
  console.log(JSON.stringify(progress, null, 2));
}

main().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
