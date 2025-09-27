import { createElement, addClass, removeClass } from '../utils/dom.js';
import { Layer } from './layer.js';

export class SpeedLayer {
    constructor(theme) {
        this.theme = theme;
        this.player = theme.player;
        this.container = theme.container;
        this.layer = new Layer(this.container);
        this.speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        this.currentSpeed = 1;
    }

    show() {
        const content = this.createContent();
        this.layer.create(content, 'malgnplayer-speed-layer');
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
        const wrapper = createElement('div', { className: 'malgnplayer-speed-menu' });

        const list = createElement('div', { className: 'malgnplayer-speed-list' });

        this.speedOptions.forEach(speed => {
            const item = createElement('div', {
                className: `malgnplayer-speed-item ${speed === this.currentSpeed ? 'active' : ''}`,
                innerHTML: `${speed}x${speed === 1 ? ' (보통)' : ''}`
            });

            item.addEventListener('click', () => {
                this.selectSpeed(speed);
            });

            list.appendChild(item);
        });

        wrapper.appendChild(list);

        return wrapper;
    }

    selectSpeed(speed) {
        this.currentSpeed = speed;
        this.player.setPlaybackRate(speed);

        // Update button text in controls component
        if (this.theme.controls && this.theme.controls.speedText) {
            this.theme.controls.speedText.textContent = `${speed}x`;
        }

        // Update active state in the menu
        const items = this.layer.layer.querySelectorAll('.malgnplayer-speed-item');
        items.forEach(item => {
            removeClass(item, 'active');
            if (item.textContent.startsWith(`${speed}x`)) {
                addClass(item, 'active');
            }
        });

        this.hide();
    }

    getCurrentSpeed() {
        return this.currentSpeed;
    }

    destroy() {
        this.layer.destroy();
    }
}