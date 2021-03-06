import queryString from 'query-string';

// Default base config for client.
const baseConfig = {
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
};

/**
 * Class for making API calls.
 */
class Api {
    /**
     * Make a GET request.
     *
     * @param  {Object} config The API-call config.
     *
     * @return {Promise}       A promise which resolves/rejects once the call
     *                           is done.
     */
    get(config) {
        return this.request({
            ...baseConfig,
            ...config,
            method: 'GET'
        }, null);
    }

    /**
     * Make a POST request.
     *
     * @param  {Object} config The API-call config.
     * @param  {Object} body   The requestr body.
     *
     * @return {Promise}       A promise which resolves/rejects once the call
     *                           is done.
     */
    post(config, body) {
        const reqBody = typeof body === 'string' ? body : JSON.stringify(body);
        return this.request({
            ...baseConfig,
            ...config,
            method: 'POST'
        }, reqBody);
    }

    /**
     * Make a POST request.
     *
     * @param  {Object} config The API-call config.
     * @param  {Object} body   The requestr body.
     *
     * @return {Promise}       A promise which resolves/rejects once the call
     *                           is done.
     */
    postForm(config, body) {
        const reqConfig = {
            ...baseConfig,
            ...config,
            method: 'POST'
        };
        delete reqConfig.headers['Content-Type'];

        return this.request(reqConfig, body);
    }


    /**
     * Make a PUT request.
     *
     * @param  {Object} config The API-call config.
     * @param  {Object} body   The request body.
     *
     * @return {Promise}       A promise which resolves/rejects once the call
     *                           is done.
     */
    put(config, body) {
        const reqBody = typeof body === 'string' ? body : JSON.stringify(body);
        return this.request({
            ...baseConfig,
            ...config,
            method: 'PUT'
        }, reqBody);
    }


    /**
     * Make a DELETE request.
     *
     * @param  {Object} config The API-call config.
     *
     * @return {Promise}       A promise which resolves/rejects once the call
     *                           is done.
     */
    delete(config, body) {
        const reqBody = typeof body === 'string' ? body : JSON.stringify(body);
        return this.request({
            ...baseConfig,
            ...config,
            method: 'DELETE'
        }, reqBody);
    }


    /**
     * Constructs the URL out of the given config.
     *
     * @param  {Object} config The call config.
     * @return {String}        The URL
     */
    formatUrl(config) {
        let query = '';
        if (config.query) {
            query = queryString.stringify(config.query);
        }

        if (query) {
            query = `?${query}`;
        }

        if (config.url) {
            return `${config.url}${query}`;
        }

        const protocol = config.protocol ? config.protocol : 'http';
        const hostname = config.hostname;
        const portString = config.port ? `:${config.port}` : '';
        const path = config.path ? config.path : '';

        return hostname
            ? `${protocol}://${hostname}${portString}${path}${query}`
            : `${path}${query}`;
    }

    /**
     * Makes a request.
     *
     * @param  {Object} config  The call config.
     * @param  {Object} reqBody The request body.
     *
     * @return {Promise}         A promise that resolves/rejects once the
     *                             call is done.
     */
    request(config, reqBody) {
        const accepts = typeof config.accepts !== 'undefined'
            ? config.accepts
            : 'json';

        // extract necessary fetchOptions from config
        // https://fetch.spec.whatwg.org/#requestinit
        const extracts = [
            'method',
            'headers',
            'body',
            'referrer',
            'mode',
            'credentials',
            'cache',
            'redirect',
            'integrity',
            'window'
        ];

        const fetchOptions = {
            credentials: 'include'
        };

        extracts.forEach((key) => {
            if (typeof config[key] !== 'undefined') {
                fetchOptions[key] = config[key];
            }
        });

        if (reqBody) {
            fetchOptions.body = reqBody;
        }

        const getResult = (response) => {
            let result = null;
            const contentType = response.headers.get('Content-Type');

            if (accepts === 'json' && contentType && contentType.startsWith('application/json')) {
                result = response.json();
            } else if (accepts === 'blob') {
                result = response.blob();
            } else {
                result = response.text();
            }

            return result;
        };

        return fetch(this.formatUrl(config), fetchOptions)
            .then((response) => {
                const result = getResult(response);

                if (response.ok) {
                    return result;
                }

                return result && result.then
                    ? result.then(res => Promise.reject(res))
                    : result;
            }, (response) => {
                const result = getResult(response);

                return Promise.reject(result);
            });
    }
}

export default new Api();

export {
    baseConfig
};
