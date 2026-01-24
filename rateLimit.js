const sleep = (ms) => new Promise(r => setTimeout(r, ms));

class KeyLimiter {
  constructor(minIntervalMs) {
    this.minIntervalMs = minIntervalMs;
    this.nextAt = 0;
    this.queue = Promise.resolve();
  }
  async run(fn) {
    const job = async () => {
      const now = Date.now();
      const wait = Math.max(0, this.nextAt - now);
      if (wait) await sleep(wait);
      this.nextAt = Date.now() + this.minIntervalMs;
      return fn();
    };
    this.queue = this.queue.then(job, job);
    return this.queue;
  }
}

const globalLimiter = new KeyLimiter(Number(process.env.GLOBAL_MIN_INTERVAL_MS || 350));
const perUser = new Map();

export async function limited(userId, fn, { minIntervalMs } = {}) {
  const userMin = Number(minIntervalMs ?? process.env.USER_MIN_INTERVAL_MS ?? 600);
  if (!perUser.has(userId)) perUser.set(userId, new KeyLimiter(userMin));
  return globalLimiter.run(() => perUser.get(userId).run(fn));
}

export { sleep };
