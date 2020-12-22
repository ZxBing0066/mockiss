interface Query {
    Action?: string;
    [key: string]: any;
}
interface Body {
    Action?: string;
    [key: string]: any;
}
interface Params {
    [key: string]: any;
}
interface Req {
    query: Query;
    body: Body;
    params: Params;
}
interface Res {
    Action?: string;
    RetCode?: number;
    [key: string]: any;
}

export interface Config {
    /** config for action type apis */
    action: {
        /**
         * get response when mock error
         */
        getResponseFromError: {
            (error: Error, req: Req): any;
        };
        /**
         * handle response before response send
         */
        handleResponse?: {
            (res: Res, req: Req): Res;
        };
    };
    /**
     * will delay before response send, wait for delay ms, or between min - max ms
     */
    delay?: number | [number, number];
    /** whether to use jsonc */
    jsonc?: boolean;
    /** whether to use mockjs */
    mockjs?: boolean;
}

const defaultConfig: Config = {
    action: {
        getResponseFromError: function (error, req) {
            const { query, body } = req;
            const Action = body.Action || query.Action;
            if ((error as any).code === 'MODULE_NOT_FOUND') {
                return {
                    Error: "Can't find mock module: " + Action,
                    RetCode: 404,
                    Message: 'Mock Action: ' + Action + ' fail'
                };
            }
            return {
                Error: error,
                RetCode: 502,
                Message: 'Mock Action: ' + Action + ' fail'
            };
        },
        handleResponse: function (res, req) {
            const { query, body } = req;
            let Action = body.Action || query.Action;
            if (!res.Action) {
                res.Action = Action + 'Response';
            }
            if (!('RetCode' in res)) {
                if (res.Error) {
                    res.RetCode = 500;
                } else {
                    res.RetCode = 0;
                }
            }
            return res;
        }
    },
    jsonc: true,
    mockjs: true
};

export default defaultConfig;
