export interface Config {
  skipStateCheck: boolean;
}

export const toConfig = (config: Partial<Config>): Config => ({
  skipStateCheck: false,
  ...config,
});
