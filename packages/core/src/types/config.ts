export interface Config {
  optimizeStateChange: boolean;
}

export const globalConfig: Config = {
  optimizeStateChange: true,
};

export const configMerge = (config: Partial<Config> = {}): Config =>
  Object.assign({}, globalConfig, config);
