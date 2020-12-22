# Mockiss

> 简单易用的 API Mock 工具

## 使用

-   通过 `npx` 快速使用

    1. 启动 `mockiss` 服务
        ```sh
        npx mockiss -t ./mock
        ```
    2. 创建 `mock` 文件
       在 `mock` 文件夹(由 `-t` 参数指定，默认为 `'./'`)中创建指定的 `mock` 文件，如 mock Action 为 'Test'，则创建 `Test.json`，并写入返回内容。

        Test.json

        ```json
        {
            "Message": "success",
            "Data": {
                "Info": "info",
                "Array": ["1", 2, "string"],
                "Other": {
                    "Foo": "bar"
                }
            }
        }
        ```

    3. 请求 `mock` 服务

        ```js
        console.log(await axios.post('localhost:3030?Action=Test'));
        /**
        {
            "Message": "success",
            "Data": {
                "Info": "info",
                "Array": ["1", 2, "string"],
                "Other": {
                    "Foo": "bar"
                }
            },
            "Action": "TestResponse",
            "RetCode": 0
        }
        */
        ```

## 参数

可通过 `npx mockiss --help` 查看帮助

-   **-t** `mock` 文件的文件夹

    会在指定的文件夹中寻找 `mock` 文件

-   **-p** 指定 `mock` 服务的端口号

-   **-c** 指定 `mock` 的配置文件

## 更多支持

### js 模块支持

可使用 js 模块来返回 mock 数据

Test.js

```js
module.exports = {
    Data: {
        Foo: 'bar'
    }
};
```

支持函数来返回复杂型的需求

Test.js

```js
module.exports = res => {
    const { body, query } = res;
    return {
        Data: {
            Foo: 'bar';
        },
        Body: body,
        Query: query
    }
};
```

### JSONC 支持

Test.jsonc

```jsonc
{
    // comment
    "Foo": "bar"
}
```

### mockjs 支持

通过 mockjs 来方便的生成随机数据，json、jsonc、js 都支持

Test.json

```json
{
    "array|1-10": ["Mock.js"]
}
```

response

```json
{
    "array": ["Mock.js", "Mock.js", "Mock.js", "Mock.js", "Mock.js", "Mock.js", "Mock.js"],
    "Action": "TestResponse",
    "RetCode": 0
}
```

## 自定义配置

### 配置说明

```ts
interface Config {
    /** 针对 action 类型的 API 的自定义配置 */
    action: {
        /**
         * 错误时如何返回 response
         * @param error {Error} 错误
         * @param req {object} 请求的信息，包含 body、query
         */
        getResponseFromError: {
            (error: Error, req: Req): any;
        };
        /**
         * 在 response 返回前预处理 response
         */
        handleResponse?: {
            (res: Res, req: Req): Res;
        };
    };
    /** 设置 API 的延时，可设置固定值或 [min, max] 的范围值 */
    delay?: number | [number, number];
    /** 是否启用 jsonc 支持 */
    jsonc?: boolean;
    /** 是否启用 mockjs 支持 */
    mockjs?: boolean;
}
```

### 如何使用

创建自定义配置文件

config.js

```js
module.exports = {
    delay: [100, 300]
};
```

启动时指定配置文件

```sh
npx mockiss -t ./mock -c config.js
```
