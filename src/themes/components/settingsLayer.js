import { createElement, addClass, removeClass } from '../../utils/dom.js';
import { Layer } from '../../utils/layer.js';

export class SettingsLayer {
    constructor(theme) {
        this.theme = theme;
        this.player = theme.player;
        this.container = theme.container;
        this.layer = new Layer(this.container);
    }

    show() {
        const content = this.createContent();
        this.layer.create(content, 'malgnplayer-settings-layer');
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
        const wrapper = createElement('div', { className: 'malgnplayer-settings-menu' });

        const title = createElement('div', {
            className: 'malgnplayer-settings-title',
            innerHTML: '설정'
        });
        wrapper.appendChild(title);

        // Speed Settings Section
        const speedSection = this.createSpeedSection();
        wrapper.appendChild(speedSection);

        // Quality Settings Section (if HLS)
        if (this.player.plugins.hls && this.player.getQualityLevels().length > 0) {
            const qualitySection = this.createQualitySection();
            wrapper.appendChild(qualitySection);
        }

        return wrapper;
    }

    createSpeedSection() {
        const section = createElement('div', { className: 'malgnplayer-settings-section' });

        const header = createElement('div', {
            className: 'malgnplayer-settings-header',
            innerHTML: '재생 속도'
        });

        const speedButton = createElement('button', {
            className: 'malgnplayer-settings-button',
            innerHTML: `${this.player.getPlaybackRate()}x`
        });

        speedButton.addEventListener('click', () => {
            this.hide();
            this.theme.speedLayer.show();
        });

        section.appendChild(header);
        section.appendChild(speedButton);

        return section;
    }

    createQualitySection() {
        const section = createElement('div', { className: 'malgnplayer-settings-section' });

        const header = createElement('div', {
            className: 'malgnplayer-settings-header',
            innerHTML: '화질'
        });

        const qualities = this.player.getQualityLevels();
        const currentQuality = this.player.getCurrentQuality();

        const qualityList = createElement('div', { className: 'malgnplayer-quality-list' });

        // Auto quality option
        const autoItem = createElement('div', {
            className: `malgnplayer-quality-item ${currentQuality === -1 ? 'active' : ''}`,
            innerHTML: '자동'
        });

        autoItem.addEventListener('click', () => {
            this.player.setCurrentQuality(-1);
            this.updateQualitySelection(-1);
        });

        qualityList.appendChild(autoItem);

        // Manual quality options
        qualities.forEach((quality, index) => {
            const qualityText = this.getQualityText(quality);
            const item = createElement('div', {
                className: `malgnplayer-quality-item ${index === currentQuality ? 'active' : ''}`,
                innerHTML: qualityText
            });

            item.addEventListener('click', () => {
                this.player.setCurrentQuality(index);
                this.updateQualitySelection(index);
            });

            qualityList.appendChild(item);
        });

        section.appendChild(header);
        section.appendChild(qualityList);

        return section;
    }

    getQualityText(quality) {
        if (quality.height) {
            return `${quality.height}p`;
        } else if (quality.width) {
            return `${quality.width}w`;
        } else if (quality.bitrate) {
            return `${Math.round(quality.bitrate / 1000)}k`;
        }
        return '알 수 없음';
    }

    updateQualitySelection(selectedIndex) {
        const items = this.layer.layer.querySelectorAll('.malgnplayer-quality-item');
        items.forEach((item, index) => {
            removeClass(item, 'active');
            if ((selectedIndex === -1 && index === 0) || (index === selectedIndex + 1)) {
                addClass(item, 'active');
            }
        });
    }

    destroy() {
        this.layer.destroy();
    }
}