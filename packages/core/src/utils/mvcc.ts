export type Version = number;

export interface MVCC<T> {
  get(version?: Version): T;
  set(v: T, version?: Version): Version;
  commit(version: Version): void;
  rollback(version: Version): void;
}

export const mvcc = <T>(state: T): MVCC<T> => {
  let id = 0;
  const versions: Record<Version, T> = {};

  return {
    get: (version = -1): T => (~version ? versions[version] : state),
    set: (
      value: T,
      version = id === Number.MAX_SAFE_INTEGER
        ? (id = Number.MIN_SAFE_INTEGER)
        : ++id,
    ): Version => {
      versions[version] = value;
      return version;
    },
    commit: (version: Version): void => {
      state = versions[version];
      delete versions[version];
    },
    rollback: (version: Version): void => {
      delete versions[version];
    },
  };
};
