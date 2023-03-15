import trigger from '../utils/trigger'
import { ariaKeyCodes } from './constants'
import { q$$ } from '../../global/selector'

const setCheckedRadioItem = (itemCollection, itemIdx) => {
    itemCollection.forEach(($item, idx) => {
        if (idx !== itemIdx) {
            $item.setAttribute('aria-checked', false)
            /* eslint-disable no-param-reassign */
            $item.checked = false
            return
        }

        $item.setAttribute('aria-checked', true)
        $item.checked = true
        $item.focus()

        trigger($item, 'change')
    })
}

const calculateTargetItemPosition = (lastItemIdx, currentIdx) => {
    switch (true) {
        case currentIdx > lastItemIdx:
            return 0
        case currentIdx < 0:
            return lastItemIdx
        default:
            return currentIdx
    }
}

const handleItemKeyDown = (itemCollection) => (e) => {
    const { keyCode } = e
    const itemIdx = itemCollection.indexOf(e.currentTarget)
    const lastCollectionItemIdx = itemCollection.length - 1

    if (Object.values(ariaKeyCodes).includes(keyCode)) {
        e.preventDefault()
        e.stopPropagation()
    }

    switch (keyCode) {
        case ariaKeyCodes.LEFT:
        case ariaKeyCodes.UP: {
            const prevItemIdx = calculateTargetItemPosition(lastCollectionItemIdx, itemIdx - 1)
            itemCollection[prevItemIdx].focus()
            setCheckedRadioItem(itemCollection, itemIdx - 1)
            break
        }
        case ariaKeyCodes.RIGHT:
        case ariaKeyCodes.DOWN: {
            const nextItemIdx = calculateTargetItemPosition(lastCollectionItemIdx, itemIdx + 1)
            itemCollection[nextItemIdx].focus()
            setCheckedRadioItem(itemCollection, itemIdx + 1)
            break
        }

        default:
            break
    }
}

export default ($container, itemSelector) => {
    const $itemCollection = q$$($container, itemSelector)

    $container.addEventListener('keydown', itemSelector, handleItemKeyDown($itemCollection))
}
