import { q$$ } from '../global/selector'

export class VideoGallery {
    constructor($element) {
        this.$player = $element.querySelector('.js-video-player')
        this.$videos = q$$('.js-video-item', $element)
        this.currentVideo = {}
        this.bindEvents()
    }

    selectNewVideo(e) {
        e.preventDefault()

        const $target = e.currentTarget

        this.currentVideo = {
            id: $target.dataset.videoId,
            $selectedThumb: $target,
        }

        this.setMainVideo()
        this.setActiveThumb()
    }

    setMainVideo() {
        this.$player.src = `//www.youtube.com/embed/${this.currentVideo.id}`
    }

    setActiveThumb() {
        this.$videos.classList.remove('is-active')
        this.currentVideo.$selectedThumb.classList.add('is-active')
    }

    bindEvents() {
        this.$videos.forEach(($video) =>
            $video.addEventListener('click', this.selectNewVideo.bind(this)),
        )
    }
}

export default function videoGallery() {
    const pluginKey = 'video-gallery'
    const $videoGallery = q$$(`[data-${pluginKey}]`)

    $videoGallery.forEach(($el) => {
        const isInitialized = $el.data?.videoGallery instanceof VideoGallery

        if (isInitialized) {
            return
        }

        if ('data' in $el === false) {
            /* eslint-disable no-param-reassign */
            $el.data = {}
        }

        $el.data.videoGallery = new VideoGallery($el)
    })
}
