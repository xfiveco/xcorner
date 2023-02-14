import mobileMenuToggleFactory from '../../../theme/global/mobile-menu-toggle';
import { CartPreviewEvents } from '../../../theme/global/cart-preview';
import $ from 'jquery';


describe('MobileMenuToggle', () => {
    let mobileMenuToggle;
    let $body;

    beforeEach(() => {
        const html = `
            <div class="body">
                <header class="header">
                    <a data-mobile-menu-toggle="menu">Menu</a>
                    <nav id="menu"></nav>
                </header>
            </div>
        `;

        $body = $(html);
        $body.appendTo(document.body);

        mobileMenuToggle = mobileMenuToggleFactory();
    });

    afterEach(() => {
        $body.remove();
    });

    it('should toggle menu when trigger receives click event', () => {
        spyOn(mobileMenuToggle, 'toggle');
        mobileMenuToggle.$toggle.click();

        expect(mobileMenuToggle.toggle).toHaveBeenCalled();
    });

    it('should hide menu when preview cart is open', () => {
        spyOn(mobileMenuToggle, 'hide');
        mobileMenuToggle.$menu.classList.add('is-open');
        $(mobileMenuToggle.$header).trigger(CartPreviewEvents.open);

        expect(mobileMenuToggle.hide).toHaveBeenCalled();
    });

    describe.skip('show', () => {
        it('should add active class to body', () => {
            mobileMenuToggle.show();

            expect(mobileMenuToggle.$body.classList.contains('has-active-nav-pages')).toBeTruthy();
        });

        it('should add active class to header', () => {
            mobileMenuToggle.show();

            expect(mobileMenuToggle.$header.classList.contains('is-open')).toBeTruthy();
        });

        it('should add active class to trigger', () => {
            mobileMenuToggle.show();

            expect(mobileMenuToggle.$toggle.classList.contains('is-open')).toBeTruthy();
        });

        it('should add active class to component', () => {
            mobileMenuToggle.show();

            expect(mobileMenuToggle.$menu.classList.contains('is-open')).toBeTruthy();
        });
    });

    describe.skip('hide', () => {
        beforeEach(() => {
            mobileMenuToggle.$body.classList.add('has-active-nav-pages');
            mobileMenuToggle.$header.classList.add('is-open');
            mobileMenuToggle.$toggle.classList.add('is-open');
            mobileMenuToggle.$menu.classList.add('is-open');
        });

        it('should remove active class from body', () => {
            mobileMenuToggle.style.display = 'none';

            expect(mobileMenuToggle.$body.classList.contains('has-active-nav-pages')).toBeFalsy();
        });

        it('should remove active class from header', () => {
            mobileMenuToggle.style.display = 'none';

            expect(mobileMenuToggle.$header.classList.contains('is-open')).toBeFalsy();
        });

        it('should remove active class from trigger', () => {
            mobileMenuToggle.style.display = 'none';

            expect(mobileMenuToggle.$toggle.classList.contains('is-open')).toBeFalsy();
        });

        it.skip('should remove active class from component', () => {
            mobileMenuToggle.style.display = 'none';

            expect(mobileMenuToggle.$menu.classList.contains('is-open')).toBeFalsy();
        });
    });
});
