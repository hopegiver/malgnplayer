import { icons } from './icons.js';
import { createElement, addClass, removeClass } from '../utils/dom.js';

export class VideoInteractions {
    constructor(ui) {
        this.ui = ui;
        this.player = ui.player;
        this.container = ui.container;

        this.init();
    }

    init() {
        this.createVideoArea();
        this.createCenterButton();
        this.bindEvents();
    }

    createVideoArea() {
        // Video click areas for double-click functionality
        this.videoArea = createElement('div', { className: 'malgnplayer-video-area' });

        this.leftClickArea = createElement('div', { className: 'malgnplayer-click-area malgnplayer-left-area' });
        this.centerClickArea = createElement('div', { className: 'malgnplayer-click-area malgnplayer-center-area' });
        this.rightClickArea = createElement('div', { className: 'malgnplayer-click-area malgnplayer-right-area' });

        // Seek indicators
        this.leftSeekIndicator = createElement('div', {
            className: 'malgnplayer-seek-indicator malgnplayer-left-indicator',
            innerHTML: icons.rewind10
        });
        this.rightSeekIndicator = createElement('div', {
            className: 'malgnplayer-seek-indicator malgnplayer-right-indicator',
            innerHTML: icons.forward10
        });

        this.leftClickArea.appendChild(this.leftSeekIndicator);
        this.rightClickArea.appendChild(this.rightSeekIndicator);

        this.videoArea.appendChild(this.leftClickArea);
        this.videoArea.appendChild(this.centerClickArea);
        this.videoArea.appendChild(this.rightClickArea);

        this.container.appendChild(this.videoArea);
    }

    createCenterButton() {
        // Center play/pause button (positioned relative to entire player)
        this.centerPlayButton = createElement('div', {
            className: 'malgnplayer-center-play-btn',
            innerHTML: icons.playCenter
        });
        // Add to main container instead of centerClickArea for full height centering
        this.container.appendChild(this.centerPlayButton);
    }

    bindEvents() {
        this.bindVideoAreaEvents();
        this.bindPlayerEvents();
    }

    bindVideoAreaEvents() {
        let clickTimeout;

        // Center area - single click to play/pause
        this.centerClickArea.addEventListener('click', (e) => {
            e.stopPropagation();

            if (clickTimeout) {
                clearTimeout(clickTimeout);
                clickTimeout = null;
                return;
            }

            clickTimeout = setTimeout(() => {
                this.togglePlayPause();
                clickTimeout = null;
            }, 200);
        });

        // Left area - double click to rewind 10s
        this.leftClickArea.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.seek(-10);
            this.showSeekIndicator('left');
        });

        // Right area - double click to forward 10s
        this.rightClickArea.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.seek(10);
            this.showSeekIndicator('right');
        });

        // Touch events for mobile
        let lastTap = 0;
        const doubleTapThreshold = 300;

        // Center area touch
        this.centerClickArea.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.togglePlayPause();
        });

        // Left area double tap
        this.leftClickArea.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;

            if (tapLength < doubleTapThreshold && tapLength > 0) {
                this.seek(-10);
                this.showSeekIndicator('left');
            }
            lastTap = currentTime;
        });

        // Right area double tap
        this.rightClickArea.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;

            if (tapLength < doubleTapThreshold && tapLength > 0) {
                this.seek(10);
                this.showSeekIndicator('right');
            }
            lastTap = currentTime;
        });
    }

    bindPlayerEvents() {
        // Update center button on state change
        this.player.on('play', () => {
            this.centerPlayButton.innerHTML = icons.pauseCenter;
            this.showCenterButton();
        });

        this.player.on('pause', () => {
            this.centerPlayButton.innerHTML = icons.playCenter;
            this.showCenterButton();
        });

        this.player.on('ended', () => {
            this.centerPlayButton.innerHTML = icons.playCenter;
            this.showCenterButton();
        });
    }

    togglePlayPause() {
        if (this.player.getState() === 'playing') {
            this.player.pause();
        } else {
            this.player.play();
        }
    }

    seek(seconds) {
        const currentTime = this.player.getPosition();
        const duration = this.player.getDuration();
        const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
        this.player.seek(newTime);
    }

    showCenterButton() {
        addClass(this.centerPlayButton, 'malgnplayer-center-show');

        setTimeout(() => {
            removeClass(this.centerPlayButton, 'malgnplayer-center-show');
        }, 1000);
    }

    showSeekIndicator(direction) {
        const indicator = direction === 'left' ? this.leftSeekIndicator : this.rightSeekIndicator;

        addClass(indicator, 'malgnplayer-seek-show');

        setTimeout(() => {
            removeClass(indicator, 'malgnplayer-seek-show');
        }, 500);
    }

    showInitialCenterButton() {
        // Show center button initially until first play
        addClass(this.centerPlayButton, 'malgnplayer-center-initial');

        // Hide when video starts playing for the first time
        this.player.once('play', () => {
            removeClass(this.centerPlayButton, 'malgnplayer-center-initial');
        });
    }

    destroy() {
        if (this.videoArea && this.videoArea.parentNode) {
            this.videoArea.parentNode.removeChild(this.videoArea);
        }
        if (this.centerPlayButton && this.centerPlayButton.parentNode) {
            this.centerPlayButton.parentNode.removeChild(this.centerPlayButton);
        }
    }
}