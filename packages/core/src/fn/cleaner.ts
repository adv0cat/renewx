import type { Cleaner, Disposable } from "../types/cleaner";

export const cleaner = (...items: Disposable[]): Cleaner => ({
  off: () =>
    items
      .splice(0)
      .forEach((item) => item && ("off" in item ? item.off : item)()),
  add: (...newItems: Disposable[]) =>
    newItems.forEach((item) => ~items.indexOf(item) || items.push(item)),
  remove: (item: Disposable) => delete items[items.indexOf(item)],
});
