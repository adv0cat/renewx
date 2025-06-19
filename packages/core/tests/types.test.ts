import { describe, it, expectTypeOf } from 'vitest';

import type {
  Freeze,
  ToReadOnly,
  WritableTag,
  ReadableTag,
  AnyStore,
  AnyActionStore,
  AnyStoreState,
  AnyStoresStates,
  OnlyActionStores,
  KeysOfActionStores,
  AdapterStore,
  ReadOnlyStore,
  AdapterTag,
} from '@renewx/core';
import { store, adapter } from '@renewx/core';
import type { Watcher } from '@renewx/core';
import type { Unsubscribe, ActionInfo } from '@renewx/core';
import type { Fn, OmitFirstArg, KeysOfObject } from '../src/types/core';
import type { ActionFn, ActionFnReturn } from '../src/types/action';
import type { Actions as ActionsType, StoreActions } from '../src/types/actions';

describe('types', () => {
  it('freeze preserves primitives', () => {
    expectTypeOf<Freeze<number>>().toEqualTypeOf<number>();
    expectTypeOf<Freeze<boolean>>().toEqualTypeOf<boolean>();
    expectTypeOf<Freeze<string>>().toEqualTypeOf<string>();
  });

  it('freeze deeply freezes objects and arrays', () => {
    type Example = {
      num: number;
      nested: {
        text: string;
        list: string[];
      };
      tuple: [number[], { foo: string[] }];
    };

    type Frozen = Freeze<Example>;
    expectTypeOf<Frozen>().toEqualTypeOf<{
      readonly num: number;
      readonly nested: { readonly text: string; readonly list: readonly string[] };
      readonly tuple: readonly [readonly number[], { readonly foo: readonly string[] }];
    }>();
  });

  it('tag utilities produce correct literals', () => {
    expectTypeOf<ToReadOnly<'wfoo'>>().toEqualTypeOf<'rfoo'>();
    expectTypeOf<'wtest'>().toMatchTypeOf<WritableTag>();
    expectTypeOf<'rtest'>().toMatchTypeOf<ReadableTag>();
  });

  it('any-store utilities infer state types', () => {
    interface NStore extends AnyStore<number> {}
    interface SStore extends AnyStore<string> {}

    expectTypeOf<AnyStoreState<NStore>>().toEqualTypeOf<number>();
    expectTypeOf<AnyStoresStates<[NStore, SStore]>>()
      .toEqualTypeOf<[number, string]>();
  });

  it('action-store helpers extract action store states and keys', () => {
    interface AStore extends AnyActionStore<number> {}
    interface RStore extends AnyStore<string> {}

    type Stores = { a: AStore; r: RStore };

    expectTypeOf<OnlyActionStores<Stores>>()
      .toEqualTypeOf<{ a: number; r: never }>();
    expectTypeOf<KeysOfActionStores<Stores>>()
      .toEqualTypeOf<'a'>();
  });


  it('watcher type signature', () => {
    expectTypeOf<Watcher<number>>()
      .toEqualTypeOf<(
        state: Freeze<number>,
        isFirst: boolean,
        info?: ActionInfo,
      ) => Unsubscribe | void>();
  });

  it('adapter returns adapter store', () => {
    const base = store(1);
    const derived = adapter(base, (v) => v * 2);
    expectTypeOf(derived).toEqualTypeOf<AdapterStore<number>>();
    expectTypeOf<AdapterStore<number>>().toMatchTypeOf<
      ReadOnlyStore<number, AdapterTag>
    >();
  });

  it('core utility types work', () => {
    expectTypeOf<Fn<string>>().toEqualTypeOf<(...v: any[]) => string>();
    expectTypeOf<Unsubscribe>().toEqualTypeOf<() => void>();
    expectTypeOf<OmitFirstArg<(a: number, b: string, c: boolean) => void>>()
      .toEqualTypeOf<[b: string, c: boolean]>();
    expectTypeOf<KeysOfObject<{ a: number; b: never; c: string }>>()
      .toEqualTypeOf<'a' | 'c'>();
  });

  it('action helpers enforce state types', () => {
    interface NStore extends AnyActionStore<number> {}

    expectTypeOf<ActionFn<NStore>>()
      .toEqualTypeOf<(
        state: Freeze<number>,
        ...v: any[]
      ) => ActionFnReturn<number, 'ws'>>();
    expectTypeOf<ActionFnReturn<number, 'ws'>>()
      .toEqualTypeOf<number | Freeze<number>>();
  });

  it('actions map functions without state argument', () => {
    interface S extends AnyActionStore<number> {}
    type Pre = {
      inc: (state: Freeze<number>, step: number) => number;
    };
    expectTypeOf<ActionsType<S, Pre>>()
      .toEqualTypeOf<{ inc: (step: number) => void }>();

    expectTypeOf<StoreActions<S>>()
      .toMatchTypeOf<{ store: S; off(): void; set(newState: any, info?: ActionInfo): void }>();
  });
});

