import { batchStoresEnd, batchStoresStart } from "./directed-acyclic-graph";
import { batchQueueEnd, batchQueueStart } from "./queue-api";

interface BatchItem {
  start(): void;
  end(): void;
}

interface Batch {
  stores: BatchItem;
  notify: BatchItem;
}

export const batch: Batch = {
  stores: {
    start: batchStoresStart,
    end: batchStoresEnd,
  },
  notify: {
    start: batchQueueStart,
    end: batchQueueEnd,
  },
};
