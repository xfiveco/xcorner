import CartHooks from './cart'
import ProductHooks from './product'
import SearchHooks from './search'
import FacetedSearchHooks from './faceted-search'
import SortByHooks from './sort-by'

const internals = {}

internals.classes = {
    cart: new CartHooks(),
    product: new ProductHooks(),
    search: new SearchHooks(),
    faceted: new FacetedSearchHooks(),
    sort: new SortByHooks(),
}

internals.parseHooks = (hookName) => {
    const hookType = hookName.split('-')[0]

    if (internals.classes[hookType] === undefined) {
        throw new Error(`${hookType} is not a valid hookType`)
    }

    return internals.classes[hookType]
}

class Hooks {
    on(hookName, callback) {
        const hook = internals.parseHooks(hookName)

        return hook.on(hookName, callback)
    }

    off(hookName, callback) {
        const hook = internals.parseHooks(hookName)

        return hook.off(hookName, callback)
    }

    emit(hookName, ...args) {
        const hook = internals.parseHooks(hookName)

        return hook.emit(args)
    }
}

export default new Hooks()
