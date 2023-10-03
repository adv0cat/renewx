export type Version = number;

export interface MVCC<T> {
  get(version?: Version): T;
  set(v: T, version?: Version): Version;
  commit(version: Version): void;
  rollback(version: Version): void;
}

export const mvcc = <T>(state: T): MVCC<T> => {
  let id = 0;
  let committed = 0;

  const versions = new Map<Version, T>([[id, state]]);

  return {
    get: (version = committed): T => {
      // TODO: simplify, when integrate
      if (versions.has(version)) {
        return versions.get(version)!;
      }
      throw new Error(`[MVCC] No state version "${version}"`);
    },
    set: (
      value: T,
      version = id === Number.MAX_SAFE_INTEGER
        ? (id = Number.MIN_SAFE_INTEGER)
        : ++id,
    ): Version => {
      versions.set(version, value);
      return version;
    },
    commit: (version: Version): void => {
      const expired = committed;
      committed = version;
      versions.delete(expired);
    },
    rollback: (version: Version): void => {
      versions.delete(version);
    },
  };
};
