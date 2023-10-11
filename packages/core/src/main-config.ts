import type { Config } from "./types/config";

export const mainConfig: Config = {
  stateCheck: true,
};

export const mergeConfig = (config: Partial<Config> = {}): Config =>
  Object.assign({}, mainConfig, config);
