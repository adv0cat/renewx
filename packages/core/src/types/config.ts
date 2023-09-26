export interface Config {
  stateCheck: boolean;
}

export const mainConfig: Config = {
  stateCheck: true,
};

export const mergeConfig = (config: Partial<Config> = {}): Config =>
  Object.assign(config, mainConfig);
