#!/usr/bin/env node

import Commander from 'commander';
import { ConsoleHandler, getLogger, SimpleFormater } from '@stool/logging';

import { run } from './node.mjs';

const FORCE_TIMEOUT = 8*1000;

const program = new Commander.Command();
program
    .version('0.0.1')
    .option('-c, --config <path>', 'set config path', './odss.json')
    .option('-s, --shell', 'Run with shell', false)
    .option('-d, --dev', 'Run in dev mode', false)
    .option('-n, --npm-install', 'Install missing requirements', false)
    .option('-b, --bundles <bundles>', 'Install bundle', (v, p) => p.concat(v.split(',')), [])
    .option('-p, --properties <properties>', 'Property', (v, p) => p.concat(v), [])
    .option('--paths <paths>', 'Set extra paths.', (v,p) => p.concat(v.split(',')), [])
    .option('--log-level <logLevel>', '<disable | error | warn | info | debug> Level of logging.')
    .option('-e, --env <env>', '<dev | prod> Enviroment.')
    .option('-v, --verbose', 'Verbose.', (v,p) => p += 1, 0)


program.parse(process.argv);

(async function() {
    const options = program.opts();
    console.log(options);

    const logger = getLogger();
    const handler = new ConsoleHandler();
    const s = [SimpleFormater.MINIMAL, SimpleFormater.BASIC, SimpleFormater.FULL];
    handler.setFormater(new SimpleFormater(s[options.verbose||0]));
    logger.addHandler(handler);
    const logLevel = options.logLevel || 'info';
    logger.setLevel(logLevel);

    let root = await run(process.cwd(), options);
    let shuttingDown = false;
    const gracefulExit = async (...args) => {
        if (!shuttingDown) {
            shuttingDown = true;
            logger.info('Stoping...');
            const timer = setTimeout(() => process.exit(1), FORCE_TIMEOUT);
            await root.stop();
            clearTimeout(timer);
            process.exit(0);
        }
    };
    const reloadAll = async () => {
        await root.stop();
        root = await run(process.cwd(), options);
    };
    // process.on('beforeExit', (code) => {
    //     console.log('Process beforeExit event with code: ', code);
    // });

    process.on('exit', (code) => {
        console.log('Process exit event with code: ', code);
        root.stop();
    });
    process.on('SIGTERM', gracefulExit); // listen for TERM signal (e.g. kill)
    process.on('SIGINT', gracefulExit); // listen for INT signal (e.g. Ctrl-C)
    process.on('SIGHUP', reloadAll)
})();
