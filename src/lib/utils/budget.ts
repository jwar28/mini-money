export interface MonthTotalsLike {
    income: number;
    expense: number;
}

// ponytail: pool model — income starts at the budget, expenses and locked
// allocations withdraw from it, additional income transactions add to it.
// `carryover` is the previous month's ending balance; it is added verbatim
// so call sites can decide on the negative-reset policy themselves
// (see dashboard: Math.max(0, prevBalance) resets when the prior month
// ended in the red).
export function computeAvailableBalance(
    salary: number,
    totals: MonthTotalsLike,
    locked: number,
    carryover: number = 0,
): number {
    return salary + totals.income - totals.expense - locked + carryover;
}

// ponytail: assert-based self-check; fails if the formula ever drifts.
if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
    const cases: Array<[number, MonthTotalsLike, number, number, number]> = [
        [1000, { income: 0, expense: 0 }, 0, 0, 1000],
        [1000, { income: 0, expense: 200 }, 100, 0, 700],
        [1000, { income: 500, expense: 200 }, 100, 0, 1200],
        [0, { income: 0, expense: 0 }, 0, 0, 0],
        [0, { income: 300, expense: 100 }, 50, 0, 150],
        [2_000_000, { income: 0, expense: 0 }, 0, 500_000, 2_500_000],
        [1_000_000, { income: 0, expense: 100_000 }, 0, 0, 900_000],
        // negative carryover is added verbatim; the call site applies max(0, …)
        [1000, { income: 0, expense: 0 }, 0, -300, 700],
    ];
    for (const [salary, totals, locked, carryover, expected] of cases) {
        const got = computeAvailableBalance(salary, totals, locked, carryover);
        if (got !== expected) {
            throw new Error(
                `computeAvailableBalance(${salary}, ${JSON.stringify(totals)}, ${locked}, ${carryover}) = ${got}, expected ${expected}`,
            );
        }
    }
}
