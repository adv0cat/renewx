export interface Config {
  optimizeStateChange: boolean;
}

export const globalConfig: Config = {
  optimizeStateChange: false,
};

export const configMerge = (config: Partial<Config> = {}): Config =>
  Object.assign({}, globalConfig, config);
