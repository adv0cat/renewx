export const getArgsForLog = (args: unknown[]) =>
  args.map((v) => JSON.stringify(v)).join(", ");
