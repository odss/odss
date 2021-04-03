#!/usr/bin/env node

import Commander from 'commander';
import { run } from './node.mjs';

const FORCE_TIMEOUT = 8*1000;

const program = new Commander.Command();
program
  .version('0.0.1')
  .option('-c, --config <path>', 'set config path', './odss.json')
  .option('-v, --verbose', 'verbosity that can be increased', (v, p) => p + 1, 0)
  .option('-s, --shell', 'Run with shell', false)
  .option('-b, --bundles <bundles>', 'Install bundle', (v, p) => p.concat(v), [])
  .option('-p, --properties <properties>', 'Property', (v, p) => p.concat(v), [])


program.parse(process.argv);

(async function() {
      try {
        const options = program.opts();
        console.log(options);

        const root = await run(process.cwd(), options);
        let shuttingDown = false;
        const gracefulExit = async (...args) => {
            if (!shuttingDown) {
                shuttingDown = true;
                console.log('Stoping...')
                setTimeout(() => process.exit(1), FORCE_TIMEOUT);
                await root.stop();
                process.exit();
            }
        };
        process.on('SIGTERM', gracefulExit); // listen for TERM signal (e.g. kill)
        process.on('SIGINT', gracefulExit); // listen for INT signal (e.g. Ctrl-C)
    } catch(e) {
        console.error(e);
    }
})();
