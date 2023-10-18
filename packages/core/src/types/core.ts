export type IsValid = boolean;
export type Unsubscribe = () => void;
export type Fn<Result = any> = (...v: any[]) => Result;
export type OmitFirstArg<Fn> = Fn extends (arg: any, ...v: infer Args) => any
  ? Args
  : never;
export type KeysOfObject<ObjectType extends object> = {
  [Name in keyof ObjectType]: ObjectType[Name] extends never ? never : Name;
}[keyof ObjectType];
