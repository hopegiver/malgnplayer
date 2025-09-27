import { createElement, addClass, removeClass } from '../utils/dom.js';
import { Layer } from './layer.js';

export class SubtitlesLayer {
    constructor(theme) {
        this.theme = theme;
        this.player = theme.player;
        this.container = theme.container;
        this.layer = new Layer(this.container);
        this.currentSubtitle = this.player.getCurrentSubtitle();
    }

    show() {
        const content = this.createContent();
        this.layer.create(content, 'malgnplayer-subtitles-layer');
        this.layer.show();
    }

    hide() {
        this.layer.hide();
    }

    toggle() {
        if (this.layer.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    createContent() {
        const wrapper = createElement('div', { className: 'malgnplayer-subtitles-menu' });

        const list = createElement('div', { className: 'malgnplayer-subtitles-list' });

        // Get current subtitle state
        const currentSubtitle = this.player.getCurrentSubtitle();

        // Off option
        const offItem = createElement('div', {
            className: `malgnplayer-subtitles-item ${currentSubtitle === null ? 'active' : ''}`,
            innerHTML: '자막 끄기'
        });

        offItem.addEventListener('click', () => {
            this.selectSubtitle(null);
        });

        list.appendChild(offItem);

        // Available subtitles
        const subtitles = this.player.getSubtitles();
        subtitles.forEach((subtitle, arrayIndex) => {
            const realIndex = subtitle.index;
            const item = createElement('div', {
                className: `malgnplayer-subtitles-item ${currentSubtitle === realIndex ? 'active' : ''}`,
                innerHTML: subtitle.label || subtitle.language || `자막 ${arrayIndex + 1}`
            });

            item.addEventListener('click', () => {
                this.selectSubtitle(realIndex);
            });

            list.appendChild(item);
        });

        wrapper.appendChild(list);

        return wrapper;
    }

    selectSubtitle(index) {
        this.currentSubtitle = index;
        this.player.setSubtitle(index);

        // Update button state in controls component
        if (this.theme.controls && this.theme.controls.subtitlesButton) {
            if (index === null) {
                this.theme.controls.subtitlesButton.innerHTML = this.theme.controls.icons.subtitlesOff;
            } else {
                this.theme.controls.subtitlesButton.innerHTML = this.theme.controls.icons.subtitles;
            }
        }

        // Update active state in the menu
        const items = this.layer.layer.querySelectorAll('.malgnplayer-subtitles-item');
        items.forEach((item, itemIndex) => {
            removeClass(item, 'active');
            // First item (index 0) is "자막 끄기", so it's active when index is null
            if ((index === null && itemIndex === 0)) {
                addClass(item, 'active');
            }
        });

        // Find and activate the selected subtitle
        if (index !== null) {
            const subtitles = this.player.getSubtitles();
            const selectedSubtitle = subtitles.find(sub => sub.index === index);
            if (selectedSubtitle) {
                const arrayIndex = subtitles.indexOf(selectedSubtitle);
                if (items[arrayIndex + 1]) { // +1 because first item is "자막 끄기"
                    addClass(items[arrayIndex + 1], 'active');
                }
            }
        }

        this.hide();
    }

    destroy() {
        this.layer.destroy();
    }
}