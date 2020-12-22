(async function () {
    const processDOM = document.getElementById('process');
    const resultDOM = document.getElementById('result');

    const writeProcess = name => {
        const wrap = document.createElement('div');
        const status = document.createElement('span');
        status.className = 'status pending';
        status.innerText = 'pending';
        const message = document.createElement('span');
        message.className = 'message';
        message.innerText = name + ': pending';
        wrap.appendChild(status);
        wrap.appendChild(message);
        resultDOM.appendChild(wrap);
        return {
            wrap,
            status,
            message
        };
    };
    const writeResult = (doms, result) => {
        const { status, message } = doms;
        status.className = 'status success';
        status.innerText = 'success';
        message.className = 'message';
        message.innerText = result.name + ': ' + result.message;
    };
    const writeError = (doms, error) => {
        const { status, message } = doms;
        status.className = 'status error';
        status.innerText = 'error';
        message.className = 'message';
        message.innerText = error.testName + ': ' + error.message;
    };

    let totalTestCount = 0;
    let currentTestCount = 0;
    const process = () => {
        processDOM.innerText = `${++currentTestCount} / ${totalTestCount}`;
    };
    const addTest = () => {
        processDOM.innerText = `${currentTestCount} / ${++totalTestCount}`;
    };

    const test = async (name, runTest) => {
        addTest();
        const doms = writeProcess(name);
        try {
            await runTest();
            writeResult(doms, {
                name,
                message: 'success'
            });
        } catch (e) {
            console.error(e);
            e.testName = name;
            writeError(doms, e);
        }
        process();
    };
    const is = (v, vb) => {
        if (v === vb) return;
        throw new Error(`${v} is not equal to ${vb}`);
    };

    const timer = t => new Promise(resolve => setTimeout(resolve, t));
    const axios = window.axios;
    const apiBase = 'http://localhost:3030';
    const action = async (action, req, method = 'get') => {
        return (await axios[method](apiBase + `?Action=${action}`, req))?.data;
    };

    test('base', async () => {
        const res = await action('test');
        console.log(res);
        is(res?.Message, 'success');
    });

    test('return req', async () => {
        const req = {
            a: 1,
            b: 2,
            c: 'test',
            d: [1, 2, '11']
        };
        const res = await action('return', req, 'post');
        is(res.Action, 'returnResponse');
        is(res.RetCode, 0);
        delete res.Action;
        delete res.RetCode;
        is(JSON.stringify(res), JSON.stringify(req));
    });
})();
