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

        const title = createElement('div', {
            className: 'malgnplayer-subtitles-title',
            innerHTML: '자막'
        });
        wrapper.appendChild(title);

        const list = createElement('div', { className: 'malgnplayer-subtitles-list' });

        // Off option
        const offItem = createElement('div', {
            className: `malgnplayer-subtitles-item ${!this.currentSubtitle ? 'active' : ''}`,
            innerHTML: '자막 끄기'
        });

        offItem.addEventListener('click', () => {
            this.selectSubtitle(null);
        });

        list.appendChild(offItem);

        // Available subtitles
        const subtitles = this.player.getSubtitles();
        subtitles.forEach((subtitle, index) => {
            const item = createElement('div', {
                className: `malgnplayer-subtitles-item ${this.currentSubtitle === index ? 'active' : ''}`,
                innerHTML: subtitle.label || subtitle.language || `자막 ${index + 1}`
            });

            item.addEventListener('click', () => {
                this.selectSubtitle(index);
            });

            list.appendChild(item);
        });

        wrapper.appendChild(list);

        return wrapper;
    }

    selectSubtitle(index) {
        this.currentSubtitle = index;
        this.player.setSubtitle(index);

        // Update button state
        if (index === null) {
            this.theme.subtitlesButton.innerHTML = this.theme.icons.subtitlesOff;
        } else {
            this.theme.subtitlesButton.innerHTML = this.theme.icons.subtitles;
        }

        // Update active state in the menu
        const items = this.layer.layer.querySelectorAll('.malgnplayer-subtitles-item');
        items.forEach((item, itemIndex) => {
            removeClass(item, 'active');
            if ((index === null && itemIndex === 0) || (index !== null && itemIndex === index + 1)) {
                addClass(item, 'active');
            }
        });

        this.hide();
    }

    destroy() {
        this.layer.destroy();
    }
}