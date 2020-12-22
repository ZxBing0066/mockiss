import express from 'express';
import MockJS from 'mockjs';
import _ from 'lodash';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import { jsonc } from 'jsonc';

import defaultConfig, { Config } from './config';
import { wait } from './util';

const server = ({
    port = 3030,
    mockDirectory: _mockDirectory = './',
    configFile
}: {
    port?: number;
    mockDirectory?: string;
    configFile?: string;
}) => {
    const mockDirectory = path.resolve(process.cwd(), _mockDirectory);
    let customConfig: Partial<Config> = {};
    if (configFile) {
        try {
            customConfig = require(path.resolve(process.cwd(), configFile));
        } catch (error) {
            console.error('Load config from ' + configFile + ' fail, please check your config file');
            console.error(error);
            return;
        }
    }
    const config = {
        ...defaultConfig,
        ...customConfig,
        action: {
            ...defaultConfig.action,
            ...customConfig.action
        }
    };
    const app = express();
    app.use(cors() as any);
    app.use(express.json()); // for parsing application/json
    app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    app.use('*', async (req, res) => {
        const { query, body, params } = req;
        const fullReq = {
            query,
            body,
            params
        };
        const Action = body.Action || query.Action;
        if (!Action) {
            return res.status(404).end();
        }
        let response;
        try {
            const mockFile = path.resolve(process.cwd(), mockDirectory, Action);
            delete require.cache[mockFile];
            delete require.cache[mockFile + '.json'];
            delete require.cache[mockFile + '.js'];
            let mockDefine;
            if (config.jsonc && fs.existsSync(mockFile + '.jsonc')) {
                mockDefine = jsonc.parse(fs.readFileSync(mockFile + '.jsonc').toString());
            } else {
                mockDefine = require(mockFile);
            }

            if (typeof mockDefine === 'function') {
                mockDefine = mockDefine(fullReq);
            }

            const data = MockJS.mock(mockDefine);
            response = data;
        } catch (error) {
            response = config.action.getResponseFromError(error, fullReq);
        }
        // rewrite response before send
        if (config.action.handleResponse) response = config.action.handleResponse(response, fullReq);
        // before response send, wait
        if (config.delay) {
            let delay;
            if (typeof config.delay === 'number') {
                delay = config.delay;
            } else {
                // wait for random delay
                delay = Math.random() * (config.delay[1] - config.delay[0]) + config.delay[0];
            }
            await wait(delay);
        }
        res.send(response);
    });
    app.listen(port);
    console.log('Mock server start on port: ' + port);
    console.log('You can create a mock file in ' + _mockDirectory + ' for mock');
};

module.exports = server;
