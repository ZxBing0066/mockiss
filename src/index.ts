#!/usr/bin/env node

/* eslint-disable node/shebang */
const yargs = require('yargs');

const server = require('./server');

yargs.usage(`
$0 <cmd> [args]
`);

yargs.command(
    '$0',
    'Run mock server',
    (yargs: any) =>
        yargs.options({
            version: {
                alias: 'v',
                describe: 'Show version number'
            },
            help: {
                alias: 'h',
                describe: 'Show help'
            },
            mockDirectory: {
                alias: 't',
                type: 'string',
                default: './',
                describe: 'Directory for place your mock files'
            },
            port: {
                alias: 'p',
                type: 'number',
                default: 3030,
                describe: 'Mock server port'
            },
            configFile: {
                alias: 'c',
                type: 'string',
                describe: 'Config file for mock server'
            }
        }),
    (argv = {}) => {
        server(argv);
    }
);

yargs.demandCommand().strict().argv;
