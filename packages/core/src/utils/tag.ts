export type Tag<
  Type extends string = "default",
  Writable extends boolean = false,
> = `${Type}-${Writable extends false ? "readOnly" : "writable"}`;
export type WritableTag = Tag<string, true>;
export type ReadableTag = Tag<string>;
export type AnyTag = Tag<string, boolean>;

export type AdapterTag = Tag<"adapter">;
export type StoreTag = Tag<"store", true>;
export type JoinTag = Tag<"join", true>;

export type ToReadOnly<SomeTag extends WritableTag> = SomeTag extends Tag<
  infer TagType,
  true
>
  ? Tag<TagType>
  : never;
