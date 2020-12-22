module.exports = {
    mockDir: './mock',
    action: {
        getResponseFromError: function (error, req) {
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
        }
    }
};
