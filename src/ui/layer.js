import { createElement, addClass, removeClass } from '../utils/dom.js';

export class Layer {
    constructor(container) {
        this.container = container;
        this.layer = null;
        this.isVisible = false;
    }

    create(content, className = '') {
        if (this.layer) {
            this.destroy();
        }

        this.layer = createElement('div', {
            className: `malgnplayer-layer ${className}`
        });

        if (typeof content === 'string') {
            this.layer.innerHTML = content;
        } else {
            this.layer.appendChild(content);
        }

        this.container.appendChild(this.layer);

        // Add click outside to close
        this.layer.addEventListener('click', (e) => {
            if (e.target === this.layer) {
                this.hide();
            }
        });

        return this.layer;
    }

    show() {
        if (this.layer) {
            addClass(this.layer, 'malgnplayer-layer-visible');
            this.isVisible = true;
        }
    }

    hide() {
        if (this.layer) {
            removeClass(this.layer, 'malgnplayer-layer-visible');
            this.isVisible = false;
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    destroy() {
        if (this.layer && this.layer.parentNode) {
            this.layer.parentNode.removeChild(this.layer);
        }
        this.layer = null;
        this.isVisible = false;
    }
}