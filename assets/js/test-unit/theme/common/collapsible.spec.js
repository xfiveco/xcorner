import collapsibleFactory, { CollapsibleEvents } from '../../../theme/common/collapsible';
import $ from 'jquery';

describe.skip('Collapsible', () => {
    let collapsible;
    let collapsibles;
    let $body;

    beforeEach(() => {
        const html = `
            <div>
                <div data-collapsible data-collapsible-target="content">Toggle</div>
                <div id="content">Content</div>
                <div data-collapsible data-collapsible-target="content2">Toggle</div>
                <div id="content2">
                    <div data-collapsible data-collapsible-target="content2-subcontent">Toggle</div>
                    <div id="content2-subcontent">Content</div>
                </div>
            </div>
        `;

        $body = $(html);
        $body.appendTo(document.body);

        collapsibles = collapsibleFactory();
        collapsible = collapsibles[0];
    });

    afterEach(() => {
        $body.remove();
    });

    describe('when clicking on a toggle', () => {
        beforeEach(() => {
            jest.spyOn(collapsible, 'open').mockImplementation(() => {});
            jest.spyOn(collapsible, 'close').mockImplementation(() => {});
            jest.spyOn(collapsible, 'toggle');
        });

        it('should open if it is closed', () => {
            collapsible.$target.classList.remove('is-open');
            collapsible.$target.style.display = 'none';
            $(collapsible.$toggle).trigger(CollapsibleEvents.click);

            expect(collapsible.open).toHaveBeenCalled();
        });

        it('should close if it is open', () => {
            collapsible.$target.classList.add('is-open');
            $(collapsible.$toggle).trigger(CollapsibleEvents.click);

            expect(collapsible.close).toHaveBeenCalled();
        });

        it('should not toggle if it is disabled', () => {
            collapsible.disabled = true;
            $(collapsible.$toggle).trigger(CollapsibleEvents.click);

            expect(collapsible.toggle).not.toHaveBeenCalled();
        });
    });

    describe('set disabled', () => {
        beforeEach(() => {
            spyOn(collapsible, 'open');
            spyOn(collapsible, 'close');
        });

        describe('if disabled', () => {
            it('should open if default disabled state is open', () => {
                collapsible.disabledState = 'open';
                collapsible.disabled = true;

                expect(collapsible.open).toHaveBeenCalled();
            });

            it('should open if default disabled state is closed', () => {
                collapsible.disabledState = 'closed';
                collapsible.disabled = true;

                expect(collapsible.close).toHaveBeenCalled();
            });
        });

        describe('if enabled', () => {
            it('should open if default enabled state is open', () => {
                collapsible.enabledState = 'open';
                collapsible.disabled = false;

                expect(collapsible.open).toHaveBeenCalled();
            });

            it('should open if default enabled state is closed', () => {
                collapsible.enabledState = 'closed';
                collapsible.disabled = false;

                expect(collapsible.close).toHaveBeenCalled();
            });
        });
    });

    describe('open', () => {
        it('should add active class to toggle', () => {
            collapsible.open();

            expect(collapsible.$toggle.classList.contains('is-open')).toBeTruthy();
        });

        it('should add active class to target', () => {
            collapsible.open();

            expect(collapsible.$target.classList.contains('is-open')).toBeTruthy();
        });

        it('should trigger open event', (done) => {
            $body.on(CollapsibleEvents.open, (event, anyCollapsible) => {
                expect(anyCollapsible).toEqual(collapsible);
                done();
            });

            collapsible.open();
        });

        it('should trigger toggle event', (done) => {
            $body.on(CollapsibleEvents.toggle, (event, anyCollapsible) => {
                expect(anyCollapsible).toEqual(collapsible);
                done();
            });

            collapsible.open();
        });
    });

    describe('close', () => {
        it('should remove active class from toggle', () => {
            collapsible.$toggle.classList.add('is-open');
            collapsible.close();

            expect(collapsible.$toggle.classList.contains('is-open')).toBeFalsy();
        });

        it('should remove active class from target', () => {
            collapsible.$target.classList.add('is-open');
            collapsible.close();

            expect(collapsible.$target.classList.contains('is-open')).toBeFalsy();
        });
    });

    describe('hasCollapsible', () => {
        let nestedCollapsible;
        let subCollapsible;

        beforeEach(() => {
            nestedCollapsible = collapsibles[1];
            subCollapsible = collapsibles[2];
        });

        it('should return true if it contains a collapsible', () => {
            expect(nestedCollapsible.hasCollapsible(subCollapsible)).toBeTruthy();
        });

        it('should return false if it does not contain a collapsible', () => {
            expect(collapsible.hasCollapsible(subCollapsible)).toBeFalsy();
        });
    });
});
