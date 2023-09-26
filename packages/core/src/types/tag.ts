export type Tag<
  Type extends string = "0",
  Writable extends boolean = false,
> = `${Writable extends false ? "r" : "w"}${Type}`;
export type WritableTag = Tag<string, true>;
export type ReadableTag = Tag<string>;
export type AnyTag = Tag<string, boolean>;
export type AdapterTag = Tag<"a">;
export type StoreTag = Tag<"s", true>;
export type JoinTag = Tag<"j", true>;
export type ToReadOnly<SomeTag extends WritableTag> = SomeTag extends Tag<
  infer TagType,
  true
>
  ? Tag<TagType>
  : never;
