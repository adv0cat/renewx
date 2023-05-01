import type { Freeze } from "../utils/freeze";
import type { Store } from "../interfaces/store";
import { store } from "../core/store";

/**
 * Types
 */

const COMMIT = Symbol("Commit");
const ROLLBACK = Symbol("Rollback");

type CommitType = typeof COMMIT;
type RollbackType = typeof ROLLBACK;

interface Tx<State> {
  get(): Freeze<State>;
  set(state: State): void;
  commit(): CommitType;
  rollback(): RollbackType;
}

interface TxError extends Error {}

interface TxPromise<Resolve> extends Promise<Resolve> {
  then<TResult1 = Resolve, TResult2 = never>(
    onfulfilled?:
      | ((value: Resolve) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: TxError) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2>;
  catch<TResult = never>(
    onrejected?:
      | ((reason: TxError) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<Resolve | TResult>;
}

/**
 * Code
 */

const tx = <State, Args extends any[]>(
  store: Store<State>,
  fn: (tx: Tx<State>, ...args: Args) => Promise<CommitType | RollbackType>
): ((...args: Args) => TxPromise<State>) => {
  // TODO: implement
  return {} as any;
};

/**
 * Example
 */

type User = {
  name: string;
  age: number;
};

const users = store([] as User[]);
const loadUsers = tx(users, async (tx, url: string) => {
  const response = await fetch(url);
  const data = (await response.json()) as User[];

  if (data.length === 0) {
    return tx.rollback();
  }

  tx.set(data);

  return tx.commit();
});

loadUsers("https://api.example.com").then(
  (users) => {
    // ...
  },
  (reason) => {
    // ...
  }
);
loadUsers("https://api.example.com").catch((reason) => {
  // ...
});
