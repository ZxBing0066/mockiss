interface Req {
    Action: string;
    [key: string]: any;
}
interface Res {
    Action?: string;
    RetCode?: number;
    [key: string]: any;
}

export interface Config {
    /**
     * get response when mock error
     */
    getResponseFromError: {
        (error: Error, req: Req): any;
    };
    /**
     * handle response before response send
     */
    handleResponse: {
        (res: Res, req: Req): Res;
    };
    /**
     * will delay before response send, wait for delay ms, or between min - max ms
     */
    delay?: number | [number, number];
    /** weather to use jsonc */
    jsonc?: boolean;
    /** weather to use mockjs */
    mockjs?: boolean;
}

const defaultConfig: Config = {
    getResponseFromError: function (error, req) {
        if ((error as any).code === 'MODULE_NOT_FOUND') {
            return {
                Error: "Can't find mock module: " + req.Action,
                RetCode: 404,
                Message: 'Mock Action: ' + req.Action + 'fail'
            };
        }
        return {
            Error: error,
            RetCode: 502,
            Message: 'Mock Action: ' + req.Action + 'fail'
        };
    },
    handleResponse: function (res, req) {
        if (!res.Action) {
            res.Action = req.Action + 'Response';
        }
        if (!('RetCode' in res)) {
            if (res.Error) {
                res.RetCode = 500;
            } else {
                res.RetCode = 0;
            }
        }
        return res;
    },
    jsonc: true,
    mockjs: true
};

export default defaultConfig;
