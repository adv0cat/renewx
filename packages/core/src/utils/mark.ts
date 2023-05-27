export type Mark<
  Type extends string = "default",
  Writable extends boolean = false
> = `${Type}-${Writable extends false ? "readOnly" : "writable"}`;
export type WritableMark = Mark<string, true>;

export type AdapterMark = Mark<"adapter">;
export type StoreMark = Mark<"store", true>;
export type JoinMark = Mark<"join", true>;
export type SerialMark = Mark<"serial", true>;
