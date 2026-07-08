export type Config = {
  defaultApp: string,
  apps: Record<string, ConfigApp>;
}
export type ConfigApp = {
  bundles: string[],
}
export type State = {
  running: boolean,
  shouldReload: boolean,
}
