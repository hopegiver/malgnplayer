import { icons } from './icons.js';
import { createElement } from '../utils/dom.js';

export class Controls {
    constructor(ui) {
        this.ui = ui;
        this.player = ui.player;
        this.container = ui.container;
        this.controls = null;

        this.init();
    }

    init() {
        this.createControls();
        this.bindEvents();
    }

    createControls() {
        this.controls = createElement('div', { className: 'malgnplayer-controls' });
        const controlsBottom = createElement('div', { className: 'malgnplayer-controls-bottom' });

        // Control buttons
        const controlsLeft = createElement('div', { className: 'malgnplayer-controls-left' });
        const controlsRight = createElement('div', { className: 'malgnplayer-controls-right' });

        // Play/Pause button
        this.playButton = createElement('button', {
            className: 'malgnplayer-btn malgnplayer-play-btn',
            innerHTML: icons.play
        });

        // Rewind 10s button
        this.rewind10Button = createElement('button', {
            className: 'malgnplayer-btn malgnplayer-rewind10-btn',
            innerHTML: icons.rewind10
        });

        // Forward 10s button
        this.forward10Button = createElement('button', {
            className: 'malgnplayer-btn malgnplayer-forward10-btn',
            innerHTML: icons.forward10
        });

        // Volume controls
        const volumeContainer = createElement('div', { className: 'malgnplayer-volume-container' });
        this.volumeButton = createElement('button', {
            className: 'malgnplayer-btn malgnplayer-volume-btn',
            innerHTML: icons.volume
        });
        const volumeSlider = createElement('div', { className: 'malgnplayer-volume-slider' });
        const volumeBar = createElement('div', { className: 'malgnplayer-volume-bar' });
        const volumeLevel = createElement('div', { className: 'malgnplayer-volume-level' });
        const volumeThumb = createElement('div', { className: 'malgnplayer-volume-thumb' });

        volumeBar.appendChild(volumeLevel);
        volumeBar.appendChild(volumeThumb);
        volumeSlider.appendChild(volumeBar);
        volumeContainer.appendChild(this.volumeButton);
        volumeContainer.appendChild(volumeSlider);

        // Time display
        this.timeDisplay = createElement('div', {
            className: 'malgnplayer-time',
            innerHTML: '0:00 / 0:00'
        });

        // Speed button
        this.speedButton = createElement('button', {
            className: 'malgnplayer-btn malgnplayer-speed-btn',
            innerHTML: icons.speed
        });
        this.speedText = createElement('span', {
            className: 'malgnplayer-speed-text',
            innerHTML: '1x'
        });
        this.speedButton.appendChild(this.speedText);

        // Subtitle button
        this.subtitlesButton = createElement('button', {
            className: 'malgnplayer-btn malgnplayer-subtitles-btn',
            innerHTML: icons.subtitlesOff
        });

        // Fullscreen button
        this.fullscreenButton = createElement('button', {
            className: 'malgnplayer-btn malgnplayer-fullscreen-btn',
            innerHTML: icons.fullscreen
        });

        // Assemble controls
        controlsLeft.appendChild(this.playButton);
        controlsLeft.appendChild(this.rewind10Button);
        controlsLeft.appendChild(this.forward10Button);
        controlsLeft.appendChild(volumeContainer);
        controlsLeft.appendChild(this.timeDisplay);

        controlsRight.appendChild(this.speedButton);
        controlsRight.appendChild(this.subtitlesButton);
        controlsRight.appendChild(this.fullscreenButton);

        const controlsMain = createElement('div', { className: 'malgnplayer-controls-main' });
        controlsMain.appendChild(controlsLeft);
        controlsMain.appendChild(controlsRight);
        controlsBottom.appendChild(controlsMain);

        this.controls.appendChild(controlsBottom);
        this.container.appendChild(this.controls);

        // Store references
        this.volumeBar = volumeBar;
        this.volumeLevel = volumeLevel;
        this.volumeThumb = volumeThumb;
    }

    bindEvents() {
        // Play/Pause button
        this.playButton.addEventListener('click', () => {
            if (this.player.getState() === 'playing') {
                this.player.pause();
            } else {
                this.player.play();
            }
        });

        // Rewind 10s button
        this.rewind10Button.addEventListener('click', () => {
            this.ui.seek(-10);
        });

        // Forward 10s button
        this.forward10Button.addEventListener('click', () => {
            this.ui.seek(10);
        });

        // Volume button
        this.volumeButton.addEventListener('click', () => {
            this.player.setMute(!this.player.getMute());
        });

        // Speed button
        this.speedButton.addEventListener('click', () => {
            this.ui.subtitlesLayer.hide();
            this.ui.speedLayer.toggle();
        });

        // Subtitle button
        this.subtitlesButton.addEventListener('click', () => {
            this.ui.speedLayer.hide();
            this.ui.subtitlesLayer.toggle();
        });

        // Fullscreen button
        this.fullscreenButton.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Player events
        this.player.on('play', () => {
            this.playButton.innerHTML = icons.pause;
        });

        this.player.on('pause', () => {
            this.playButton.innerHTML = icons.play;
        });

        this.player.on('ended', () => {
            this.playButton.innerHTML = icons.play;
        });

        this.player.on('timeupdate', (data) => {
            this.updateTimeDisplay(data.currentTime, data.duration);
        });

        this.player.on('volumechange', (data) => {
            this.updateVolumeDisplay(data.volume, data.muted);
        });

        // Update subtitle button visibility when video loads
        this.player.on('loadedmetadata', () => {
            this.updateSubtitleButtonVisibility();
        });

        // Volume bar interaction
        this.volumeBar.addEventListener('click', (e) => {
            const rect = this.volumeBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.player.setVolume(percent);
        });
    }

    updateTimeDisplay(currentTime, duration) {
        const formatTime = (time) => {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };

        const current = formatTime(currentTime || 0);
        const total = formatTime(duration || 0);
        this.timeDisplay.textContent = `${current} / ${total}`;
    }

    updateVolumeDisplay(volume, muted) {
        if (muted) {
            this.volumeButton.innerHTML = icons.volumeMute;
            this.volumeLevel.style.width = '0%';
        } else {
            this.volumeButton.innerHTML = icons.volume;
            this.volumeLevel.style.width = `${volume * 100}%`;
            this.volumeThumb.style.left = `${volume * 100}%`;
        }
    }

    updateSubtitleButtonVisibility() {
        const subtitles = this.player.getSubtitles();
        if (subtitles.length === 0) {
            this.subtitlesButton.style.display = 'none';
        } else {
            this.subtitlesButton.style.display = 'flex';
            // Update current subtitle state in the layer
            this.ui.subtitlesLayer.currentSubtitle = this.player.getCurrentSubtitle();
            // Update button icon based on current state
            if (this.ui.subtitlesLayer.currentSubtitle === null) {
                this.subtitlesButton.innerHTML = icons.subtitlesOff;
            } else {
                this.subtitlesButton.innerHTML = icons.subtitles;
            }
        }
    }

    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            this.fullscreenButton.innerHTML = icons.fullscreen;
        } else {
            this.container.requestFullscreen();
            this.fullscreenButton.innerHTML = icons.exitFullscreen;
        }
    }

    destroy() {
        if (this.controls && this.controls.parentNode) {
            this.controls.parentNode.removeChild(this.controls);
        }
    }
}