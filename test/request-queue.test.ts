import { describe, expect, it } from "vitest";
import {
  resetHeatmapRequestQueueForTests,
  scheduleHeatmapRequest,
} from "../src/data/request-queue";

function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("scheduleHeatmapRequest", () => {
  it("limits concurrent heatmap requests", async () => {
    resetHeatmapRequestQueueForTests();
    const started: number[] = [];
    const resolvers: Array<() => void> = [];

    const requests = [0, 1, 2, 3].map((index) =>
      scheduleHeatmapRequest(
        async () => {
          started.push(index);
          await new Promise<void>((resolve) => resolvers.push(resolve));
          return index;
        },
        { maxConcurrent: 2 },
      ),
    );

    await tick();
    expect(started).toEqual([0, 1]);

    resolvers.shift()?.();
    await tick();
    expect(started).toEqual([0, 1, 2]);

    resolvers.shift()?.();
    await tick();
    expect(started).toEqual([0, 1, 2, 3]);

    resolvers.shift()?.();
    resolvers.shift()?.();
    await expect(Promise.all(requests)).resolves.toEqual([0, 1, 2, 3]);
  });
});
