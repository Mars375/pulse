import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock the db module — intercept all chained query builder calls
// ---------------------------------------------------------------------------

function createQueryChain(resolvedValue: unknown = []) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};

  const makeChainable = (): Record<string, ReturnType<typeof vi.fn>> => {
    const proxy: Record<string, ReturnType<typeof vi.fn>> = {};
    const methods = [
      "select", "from", "where", "innerJoin", "leftJoin",
      "groupBy", "orderBy", "limit", "offset",
    ];
    for (const method of methods) {
      proxy[method] = vi.fn().mockReturnValue(proxy);
    }
    // The chain is thenable — awaiting it returns resolvedValue
    proxy.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
      return Promise.resolve(resolvedValue).then(resolve);
    });
    return proxy;
  };

  Object.assign(chain, makeChainable());
  // db.select() should start a new chain
  chain.select = vi.fn().mockImplementation(() => {
    const inner = makeChainable();
    return inner;
  });

  return chain;
}

let mockDb: ReturnType<typeof createQueryChain>;

vi.mock("@/lib/db", () => ({
  get db() {
    return mockDb;
  },
}));

// We also need to mock drizzle-orm operators so imports don't fail
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: unknown[]) => ({ op: "eq", args })),
  and: vi.fn((...args: unknown[]) => ({ op: "and", args })),
  or: vi.fn((...args: unknown[]) => ({ op: "or", args })),
  gte: vi.fn((...args: unknown[]) => ({ op: "gte", args })),
  lte: vi.fn((...args: unknown[]) => ({ op: "lte", args })),
  desc: vi.fn((col: unknown) => ({ op: "desc", col })),
  asc: vi.fn((col: unknown) => ({ op: "asc", col })),
  count: vi.fn(() => "count"),
  sum: vi.fn((col: unknown) => ({ op: "sum", col })),
  like: vi.fn((...args: unknown[]) => ({ op: "like", args })),
  isNull: vi.fn((col: unknown) => ({ op: "isNull", col })),
  isNotNull: vi.fn((col: unknown) => ({ op: "isNotNull", col })),
  sql: vi.fn((...args: unknown[]) => ({ op: "sql", args })),
}));

// ---------------------------------------------------------------------------
// Tests — focus on return shape and edge cases
// ---------------------------------------------------------------------------

describe("getChurnMetrics()", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns correct shape with normal data", async () => {
    // Each db.select() call in getChurnMetrics resolves to a single-element array.
    // There are 4 sequential db.select() calls:
    //   1) churnedResult  -> [{ count: 5 }]
    //   2) totalAtStart   -> [{ count: 100 }]
    //   3) prevChurned    -> [{ count: 3 }]
    //   4) prevTotalStart -> [{ count: 90 }]
    const callResults = [
      [{ count: 5 }],
      [{ count: 100 }],
      [{ count: 3 }],
      [{ count: 90 }],
    ];
    let callIndex = 0;

    mockDb = {} as ReturnType<typeof createQueryChain>;
    mockDb.select = vi.fn().mockImplementation(() => {
      const result = callResults[callIndex] ?? [{ count: 0 }];
      callIndex++;
      const chain = createChainResolving(result);
      return chain;
    });

    const { getChurnMetrics } = await import("@/lib/db/queries");
    const metrics = await getChurnMetrics("org-1", "30d");

    expect(metrics).toHaveProperty("churnRate");
    expect(metrics).toHaveProperty("previousChurnRate");
    expect(metrics).toHaveProperty("churnedCount");
    expect(typeof metrics.churnRate).toBe("number");
    expect(typeof metrics.previousChurnRate).toBe("number");
    expect(typeof metrics.churnedCount).toBe("number");
    // churnRate = (5/100)*100 = 5.0
    expect(metrics.churnRate).toBe(5);
    expect(metrics.churnedCount).toBe(5);
    // previousChurnRate = (3/90)*100 = 3.333... -> 3.3
    expect(metrics.previousChurnRate).toBe(3.3);
  });

  it("handles zero total customers (division by zero)", async () => {
    const callResults = [
      [{ count: 0 }],
      [{ count: 0 }],
      [{ count: 0 }],
      [{ count: 0 }],
    ];
    let callIndex = 0;

    mockDb = {} as ReturnType<typeof createQueryChain>;
    mockDb.select = vi.fn().mockImplementation(() => {
      const result = callResults[callIndex] ?? [{ count: 0 }];
      callIndex++;
      return createChainResolving(result);
    });

    const { getChurnMetrics } = await import("@/lib/db/queries");
    const metrics = await getChurnMetrics("org-1", "30d");

    expect(metrics.churnRate).toBe(0);
    expect(metrics.previousChurnRate).toBe(0);
    expect(metrics.churnedCount).toBe(0);
  });

  it("handles empty / null query results", async () => {
    const callResults = [
      [{ count: null }],
      [{ count: null }],
      [{ count: null }],
      [{ count: null }],
    ];
    let callIndex = 0;

    mockDb = {} as ReturnType<typeof createQueryChain>;
    mockDb.select = vi.fn().mockImplementation(() => {
      const result = callResults[callIndex] ?? [{ count: 0 }];
      callIndex++;
      return createChainResolving(result);
    });

    const { getChurnMetrics } = await import("@/lib/db/queries");
    const metrics = await getChurnMetrics("org-1", "30d");

    expect(metrics.churnRate).toBe(0);
    expect(metrics.previousChurnRate).toBe(0);
    expect(metrics.churnedCount).toBe(0);
  });
});

describe("getCohortRetention()", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns array of { cohort, months[] }", async () => {
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const cohortMonth = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, "0")}`;

    const mockCustomers = [
      { id: "c1", signupMonth: cohortMonth, signupDate: sixMonthsAgo, churnedAt: null },
      { id: "c2", signupMonth: cohortMonth, signupDate: sixMonthsAgo, churnedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) },
    ];

    mockDb = {} as ReturnType<typeof createQueryChain>;
    mockDb.select = vi.fn().mockImplementation(() => {
      return createChainResolving(mockCustomers);
    });

    const { getCohortRetention } = await import("@/lib/db/queries");
    const cohorts = await getCohortRetention("org-1");

    expect(Array.isArray(cohorts)).toBe(true);
    expect(cohorts.length).toBeGreaterThanOrEqual(1);
    for (const cohort of cohorts) {
      expect(cohort).toHaveProperty("cohort");
      expect(cohort).toHaveProperty("months");
      expect(Array.isArray(cohort.months)).toBe(true);
      for (const retention of cohort.months) {
        expect(typeof retention).toBe("number");
        expect(retention).toBeGreaterThanOrEqual(0);
        expect(retention).toBeLessThanOrEqual(100);
      }
    }
  });

  it("returns empty array when no customers exist", async () => {
    mockDb = {} as ReturnType<typeof createQueryChain>;
    mockDb.select = vi.fn().mockImplementation(() => {
      return createChainResolving([]);
    });

    const { getCohortRetention } = await import("@/lib/db/queries");
    const cohorts = await getCohortRetention("org-1");

    expect(cohorts).toEqual([]);
  });
});

describe("getChurnReasons()", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns array of { reason, count, percentage }", async () => {
    const mockRows = [
      { reason: "Too expensive", count: 10 },
      { reason: "Missing features", count: 5 },
      { reason: "Switched competitor", count: 5 },
    ];

    mockDb = {} as ReturnType<typeof createQueryChain>;
    mockDb.select = vi.fn().mockImplementation(() => {
      return createChainResolving(mockRows);
    });

    const { getChurnReasons } = await import("@/lib/db/queries");
    const reasons = await getChurnReasons("org-1");

    expect(Array.isArray(reasons)).toBe(true);
    expect(reasons).toHaveLength(3);
    expect(reasons[0]).toEqual({ reason: "Too expensive", count: 10, percentage: 50 });
    expect(reasons[1]).toEqual({ reason: "Missing features", count: 5, percentage: 25 });
    expect(reasons[2]).toEqual({ reason: "Switched competitor", count: 5, percentage: 25 });
  });

  it("handles empty results", async () => {
    mockDb = {} as ReturnType<typeof createQueryChain>;
    mockDb.select = vi.fn().mockImplementation(() => {
      return createChainResolving([]);
    });

    const { getChurnReasons } = await import("@/lib/db/queries");
    const reasons = await getChurnReasons("org-1");

    expect(reasons).toEqual([]);
  });

  it("handles null reason by defaulting to 'Unknown'", async () => {
    const mockRows = [{ reason: null, count: 3 }];

    mockDb = {} as ReturnType<typeof createQueryChain>;
    mockDb.select = vi.fn().mockImplementation(() => {
      return createChainResolving(mockRows);
    });

    const { getChurnReasons } = await import("@/lib/db/queries");
    const reasons = await getChurnReasons("org-1");

    expect(reasons[0].reason).toBe("Unknown");
    expect(reasons[0].percentage).toBe(100);
  });
});

describe("getAtRiskCustomers()", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns array of customer objects", async () => {
    const mockCustomers = [
      {
        id: "c1",
        orgId: "org-1",
        name: "Acme Corp",
        email: "acme@example.com",
        plan: "pro",
        mrrValue: 7900,
        signupDate: new Date("2025-01-15"),
        churnedAt: null,
        churnReason: null,
        createdAt: new Date("2025-01-15"),
      },
    ];

    // getAtRiskCustomers has 3 db.select() calls:
    //   1) subquery for downgraded customer IDs (not awaited, used in SQL)
    //   2) subquery for past due customer IDs (not awaited, used in SQL)
    //   3) main query returning customer rows (awaited)
    // The first two are subqueries (not awaited), so the mock chain just needs to
    // be returned. The third is the one that resolves.
    let callIndex = 0;
    mockDb = {} as ReturnType<typeof createQueryChain>;
    mockDb.select = vi.fn().mockImplementation(() => {
      callIndex++;
      if (callIndex <= 2) {
        // Subqueries — return a chain but it won't be awaited directly
        return createChainResolving([]);
      }
      // Main query
      return createChainResolving(mockCustomers);
    });

    const { getAtRiskCustomers } = await import("@/lib/db/queries");
    const atRisk = await getAtRiskCustomers("org-1");

    expect(Array.isArray(atRisk)).toBe(true);
    expect(atRisk).toHaveLength(1);
    expect(atRisk[0]).toHaveProperty("id", "c1");
    expect(atRisk[0]).toHaveProperty("name", "Acme Corp");
    expect(atRisk[0]).toHaveProperty("mrrValue", 7900);
  });

  it("returns empty array when no at-risk customers", async () => {
    let callIndex = 0;
    mockDb = {} as ReturnType<typeof createQueryChain>;
    mockDb.select = vi.fn().mockImplementation(() => {
      callIndex++;
      return createChainResolving([]);
    });

    const { getAtRiskCustomers } = await import("@/lib/db/queries");
    const atRisk = await getAtRiskCustomers("org-1");

    expect(atRisk).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Helper: create a chain of chainable methods that resolves to a value
// ---------------------------------------------------------------------------

function createChainResolving(resolvedValue: unknown) {
  const methods = [
    "select", "from", "where", "innerJoin", "leftJoin",
    "groupBy", "orderBy", "limit", "offset",
  ];

  const chain: Record<string, unknown> = {};

  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }

  // Make the chain thenable so `await db.select().from().where()` resolves
  chain.then = vi.fn().mockImplementation(
    (resolve?: (v: unknown) => unknown, reject?: (e: unknown) => unknown) => {
      return Promise.resolve(resolvedValue).then(resolve, reject);
    }
  );

  return chain;
}
