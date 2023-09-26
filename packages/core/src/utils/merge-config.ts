import type { Config } from "../types/config";
import { mainConfig } from "../main-config";

export const mergeConfig = (config: Partial<Config> = {}): Config =>
  Object.assign(config, mainConfig);
