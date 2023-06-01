import trigger from './trigger'

const urlUtils = {
    getUrl: () => `${window.location.pathname}${window.location.search}`,

    goToUrl: (url) => {
        try {
            window.history.pushState({}, document.title, url)
            trigger(window, 'statechange')
        } catch (error) {
            /* NOOP */
        }
    },

    replaceParams: (url, params) => {
        const parsed = urlUtils.parse(url)
        const urlQuery = new URLSearchParams(parsed.searchParams)
        let param

        // Let the formatter use the query object to build the new url
        parsed.search = null

        for (param in params) {
            if (params.hasOwnProperty(param)) {
                urlQuery.set(param, params[param])
            }
        }

        urlUtils.goToUrl(new URL(`${parsed.origin}${parsed.pathname}?${urlQuery}`))
    },

    parse: (urlString) => {
        const url = new URL(urlString)

        return url
    },
}

export default urlUtils
