import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT = path.dirname(__dirname);
export const SHELL_BUNDLES = ['@odss/shell.core', '@odss/terminal.node'];
