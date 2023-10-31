export type Config = {
  defaultApp: string,
  apps: Record<string, App>;
}
type App = {
  bundles: string[],
}
export type State = {
  running: boolean,
  shouldReload: boolean,
}
