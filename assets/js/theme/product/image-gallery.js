import { q$$ } from '../global/selector';

export default class ImageGallery {
    constructor($gallery) {
        this.$mainImage = $gallery.querySelector('.js-image-gallery-main');
        this.$mainImageNested = $gallery.querySelector('.js-main-image');
        this.$selectableImages = q$$('.js-image-gallery-item', $gallery);
        this.currentImage = {};
    }

    init() {
        this.bindEvents();
    }

    setMainImage(imgObj) {
        this.currentImage = { ...imgObj };

        this.setActiveThumb();
        this.swapMainImage();
    }

    setAlternateImage(imgObj) {
        if (!this.savedImage) {
            this.savedImage = {
                mainImageUrl: this.$mainImage.querySelector('img').src,
                zoomImageUrl: this.$mainImage.dataset.zoomImage,
                mainImageSrcset: this.$mainImage.querySelector('img')?.getAttribute('srcset'),
                $selectedThumb: this.currentImage.$selectedThumb,
            };
        }
        this.setMainImage(imgObj);
    }

    restoreImage() {
        if (this.savedImage) {
            this.setMainImage(this.savedImage);
            delete this.savedImage;
        }
    }

    selectNewImage(e) {
        e.preventDefault();

        const $target = e.currentTarget;
        const imgObj = {
            mainImageUrl: $target.dataset.imageGalleryNewImageUrl,
            zoomImageUrl: $target.dataset.imageGalleryZoomImageUrl,
            mainImageSrcset: $target.dataset.imageGalleryNewImageSrcset,
            $selectedThumb: $target,
            mainImageAlt: $target.children.item(0).alt,
        };
        this.setMainImage(imgObj);
    }

    setActiveThumb() {
        this.$selectableImages.forEach($selectableImage => $selectableImage.classList.remove('is-active'));

        if (this.currentImage.$selectedThumb) {
            this.currentImage.$selectedThumb.classList.add('is-active');
        }
    }

    swapMainImage() {
        const isBrowserIE = navigator.userAgent.includes('Trident');

        this.$mainImage.dataset.zoomImage = this.currentImage.zoomImageUrl;
        this.$mainImageNested.alt = this.currentImage.mainImageAlt;
        this.$mainImageNested.title = this.currentImage.mainImageAlt;

        if (isBrowserIE) {
            const fallbackStylesIE = {
                backgroundImage: `url(${this.currentImage.mainImageUrl})`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundOrigin: 'content-box',
                backgroundSize: 'contain',
            };

            /* eslint-disable guard-for-in */
            for (const property in fallbackStylesIE) {
                this.$mainImageNested.style[property] = fallbackStylesIE[property];
            }
        }
    }

    bindEvents() {
        this.$selectableImages.forEach($selectableImage => $selectableImage.addEventListener('click', this.selectNewImage.bind(this)));
    }
}
