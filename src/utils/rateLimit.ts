type RateLimitOptions = {
  interval: number; //  miliseconds
  uniqueTokenPerInterval: number;
};

export const rateLimit = (options?: RateLimitOptions) => {
  const tokenCache = new Map<string, number[]>();
  const interval = options?.interval || 60000;
  const limit = options?.uniqueTokenPerInterval || 500;

  return {
    check: (resLimit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const now = Date.now();
        const tokenCount = tokenCache.get(token) || [0];

        if (tokenCount[0] === 0) {
          tokenCache.set(token, [1, now]);
        } else {
          tokenCount[0] += 1;
          tokenCache.set(token, tokenCount);
        }

        const currentUsage = tokenCount[0];
        const timestamp = tokenCount[1] || now;

        const isRateLimited = currentUsage >= resLimit;
        const hasIntervalPassed = now - timestamp > interval;

        if (hasIntervalPassed) {
          tokenCache.set(token, [1, now]);
          return resolve();
        }

        if (tokenCache.size > limit) {
          tokenCache.clear();
        }

        return isRateLimited ? reject(new Error('Rate limit exceeded')) : resolve();
      }),
  };
};

export const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});
