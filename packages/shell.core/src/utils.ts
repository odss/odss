import { ID_SEPARATOR } from "./consts";

type PathId =  string | string[];

export const toPath = (id: PathId): string[] => {
  if (Array.isArray(id)) {
    return [...id];
  }
  return id
    .split(' ')
    .map(cmd => cmd.split(ID_SEPARATOR))
    .flat()
    .map(cmd => cmd.trim())
    .filter(cmd => cmd);
}
