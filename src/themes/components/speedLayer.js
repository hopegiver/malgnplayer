import { createElement, addClass, removeClass } from '../../utils/dom.js';
import { Layer } from '../../utils/layer.js';

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

        const title = createElement('div', {
            className: 'malgnplayer-speed-title',
            innerHTML: '재생 속도'
        });
        wrapper.appendChild(title);

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

        // Custom speed input section
        const customSection = createElement('div', { className: 'malgnplayer-speed-custom' });

        const customTitle = createElement('div', {
            className: 'malgnplayer-speed-custom-title',
            innerHTML: '사용자 정의'
        });

        const customInput = createElement('div', { className: 'malgnplayer-speed-input-group' });

        const input = createElement('input', {
            type: 'number',
            className: 'malgnplayer-speed-input',
            min: '0.1',
            max: '4',
            step: '0.1',
            value: this.currentSpeed.toString()
        });

        const applyBtn = createElement('button', {
            className: 'malgnplayer-speed-apply',
            innerHTML: '적용'
        });

        applyBtn.addEventListener('click', () => {
            const customSpeed = parseFloat(input.value);
            if (customSpeed >= 0.1 && customSpeed <= 4) {
                this.selectSpeed(customSpeed);
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                applyBtn.click();
            }
        });

        customInput.appendChild(input);
        customInput.appendChild(applyBtn);
        customSection.appendChild(customTitle);
        customSection.appendChild(customInput);
        wrapper.appendChild(customSection);

        return wrapper;
    }

    selectSpeed(speed) {
        this.currentSpeed = speed;
        this.player.setPlaybackRate(speed);

        // Update button text
        this.theme.speedText.textContent = `${speed}x`;

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