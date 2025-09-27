import { icons } from '../utils/icons.js';
import { createElement, addClass, removeClass, setStyles } from '../utils/dom.js';
import { SpeedLayer } from '../ui/speedLayer.js';
import { SubtitlesLayer } from '../ui/subtitlesLayer.js';

export class PlayerUI {
    constructor(player) {
        this.player = player;
        this.container = player.container;
        this.video = player.core.video;
        this.controls = null;
        this.controlsVisible = false;
        this.hideTimeout = null;
        this.speedLayer = null;
        this.subtitlesLayer = null;
        this.isDragging = false;

        this.init();
    }

    init() {
        this.createControls();
        this.createLayers();
        this.bindEvents();
        this.applyStyles();
        this.showInitialCenterButton();
        this.showInitialControls();
    }

    createLayers() {
        this.speedLayer = new SpeedLayer(this);
        this.subtitlesLayer = new SubtitlesLayer(this);
        this.icons = icons;
    }

    createVideoArea() {
        // Video click areas for double-click functionality
        this.videoArea = createElement('div', { className: 'malgnplayer-video-area' });

        this.leftClickArea = createElement('div', { className: 'malgnplayer-click-area malgnplayer-left-area' });
        this.centerClickArea = createElement('div', { className: 'malgnplayer-click-area malgnplayer-center-area' });
        this.rightClickArea = createElement('div', { className: 'malgnplayer-click-area malgnplayer-right-area' });

        // Center play/pause button (positioned relative to entire player)
        this.centerPlayButton = createElement('div', {
            className: 'malgnplayer-center-play-btn',
            innerHTML: icons.playCenter
        });
        // Add to main container instead of centerClickArea for full height centering
        this.container.appendChild(this.centerPlayButton);

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

    createControls() {
        this.createVideoArea();
        this.controls = createElement('div', { className: 'malgnplayer-controls' });

        const controlsBottom = createElement('div', { className: 'malgnplayer-controls-bottom' });

        // Progress bar
        const progressContainer = createElement('div', { className: 'malgnplayer-progress-container' });
        const progressBar = createElement('div', { className: 'malgnplayer-progress-bar' });
        const progressBuffer = createElement('div', { className: 'malgnplayer-progress-buffer' });
        const progressPlayed = createElement('div', { className: 'malgnplayer-progress-played' });
        const progressThumb = createElement('div', { className: 'malgnplayer-progress-thumb' });
        const progressTooltip = createElement('div', {
            className: 'malgnplayer-progress-tooltip',
            innerHTML: '0:00'
        });

        progressBar.appendChild(progressBuffer);
        progressBar.appendChild(progressPlayed);
        progressBar.appendChild(progressThumb);
        progressBar.appendChild(progressTooltip);
        progressContainer.appendChild(progressBar);

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

        controlsLeft.appendChild(this.playButton);
        controlsLeft.appendChild(this.rewind10Button);
        controlsLeft.appendChild(this.forward10Button);
        controlsLeft.appendChild(volumeContainer);
        controlsLeft.appendChild(this.timeDisplay);

        controlsRight.appendChild(this.speedButton);
        controlsRight.appendChild(this.subtitlesButton);
        controlsRight.appendChild(this.fullscreenButton);

        controlsBottom.appendChild(progressContainer);

        const controlsMain = createElement('div', { className: 'malgnplayer-controls-main' });
        controlsMain.appendChild(controlsLeft);
        controlsMain.appendChild(controlsRight);
        controlsBottom.appendChild(controlsMain);

        this.controls.appendChild(controlsBottom);
        this.container.appendChild(this.controls);

        // Store references
        this.progressBar = progressBar;
        this.progressPlayed = progressPlayed;
        this.progressBuffer = progressBuffer;
        this.progressThumb = progressThumb;
        this.progressTooltip = progressTooltip;
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
            this.seek(-10);
        });

        // Forward 10s button
        this.forward10Button.addEventListener('click', () => {
            this.seek(10);
        });

        // Volume button
        this.volumeButton.addEventListener('click', () => {
            this.player.setMute(!this.player.getMute());
        });

        // Speed button
        this.speedButton.addEventListener('click', () => {
            this.subtitlesLayer.hide();
            this.speedLayer.toggle();
        });

        // Subtitle button
        this.subtitlesButton.addEventListener('click', () => {
            this.speedLayer.hide();
            this.subtitlesLayer.toggle();
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
            this.updateProgress(data.currentTime, data.duration);
            this.updateTimeDisplay(data.currentTime, data.duration);
        });

        this.player.on('volumechange', (data) => {
            this.updateVolumeDisplay(data.volume, data.muted);
        });

        // Update subtitle button visibility when video loads
        this.player.on('loadedmetadata', () => {
            this.updateSubtitleButtonVisibility();
        });

        // Mouse events for auto-hide
        this.container.addEventListener('mousemove', () => {
            this.showControls();
            this.resetHideTimeout();
        });

        this.container.addEventListener('mouseleave', () => {
            this.hideControls();
        });

        // Progress bar interaction
        this.progressBar.addEventListener('click', (e) => {
            if (!this.isDragging) {
                const rect = this.progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                const duration = this.player.getDuration();
                if (duration) {
                    this.player.seek(duration * percent);
                }
            }
        });

        // Progress bar drag functionality
        this.progressBar.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.updateProgressFromMouse(e);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.updateProgressFromMouse(e);
            } else if (this.progressBar.contains(e.target) || this.progressBar === e.target) {
                this.updateProgressTooltip(e);
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                this.isDragging = false;
                // Hide tooltip if mouse is not over progress bar
                if (!this.progressBar.contains(e.target) && this.progressBar !== e.target) {
                    this.progressTooltip.style.opacity = '0';
                }
            }
        });

        // Progress bar tooltip
        this.progressBar.addEventListener('mouseenter', () => {
            this.progressTooltip.style.opacity = '1';
        });

        this.progressBar.addEventListener('mouseleave', () => {
            if (!this.isDragging) {
                this.progressTooltip.style.opacity = '0';
            }
        });

        // Volume bar interaction
        this.volumeBar.addEventListener('click', (e) => {
            const rect = this.volumeBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.player.setVolume(percent);
        });

        // Video area interactions
        this.bindVideoAreaEvents();
    }

    updateProgress(currentTime, duration) {
        if (!duration) return;

        const percent = (currentTime / duration) * 100;
        this.progressPlayed.style.width = `${percent}%`;
        this.progressThumb.style.left = `${percent}%`;
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

    updateProgressTooltip(event) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const duration = this.player.getDuration();

        if (duration) {
            const time = duration * percent;
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            this.progressTooltip.textContent = timeString;
            this.progressTooltip.style.left = `${percent * 100}%`;
        }
    }

    updateProgressFromMouse(event) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const duration = this.player.getDuration();

        if (duration) {
            const time = duration * percent;

            // Update visual progress immediately
            this.progressPlayed.style.width = `${percent * 100}%`;
            this.progressThumb.style.left = `${percent * 100}%`;

            // Update tooltip
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            this.progressTooltip.textContent = timeString;
            this.progressTooltip.style.left = `${percent * 100}%`;
            this.progressTooltip.style.opacity = '1';

            // Seek video to new position
            this.player.seek(time);
        }
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
            this.subtitlesLayer.currentSubtitle = this.player.getCurrentSubtitle();
            // Update button icon based on current state
            if (this.subtitlesLayer.currentSubtitle === null) {
                this.subtitlesButton.innerHTML = icons.subtitlesOff;
            } else {
                this.subtitlesButton.innerHTML = icons.subtitles;
            }
        }
    }

    showControls() {
        if (!this.controlsVisible) {
            addClass(this.controls, 'malgnplayer-controls-visible');
            this.controlsVisible = true;
        }
    }

    hideControls() {
        if (this.controlsVisible && this.player.getState() === 'playing') {
            removeClass(this.controls, 'malgnplayer-controls-visible');
            this.controlsVisible = false;
        }
    }

    resetHideTimeout(delay = 3000) {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        this.hideTimeout = setTimeout(() => {
            this.hideControls();
        }, delay);
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

    bindVideoAreaEvents() {
        let clickTimeout;
        let centerButtonTimeout;

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

    showInitialControls() {
        // Show controls initially
        this.showControls();

        // Set a longer timeout for initial display
        this.resetHideTimeout(5000); // 5초 후에 숨김
    }

    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .malgnplayer-controls {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0,0,0,0.7));
                color: white;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }

            .malgnplayer-controls-visible,
            .malgnplayer-controls:hover {
                opacity: 1;
                pointer-events: auto;
            }

            .malgnplayer-controls-bottom {
                padding: 10px 15px;
            }

            .malgnplayer-controls-main {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 10px;
            }

            .malgnplayer-controls-left,
            .malgnplayer-controls-right {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .malgnplayer-btn {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 8px;
                border-radius: 4px;
                transition: background-color 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .malgnplayer-btn:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }

            .malgnplayer-btn svg {
                width: 24px;
                height: 24px;
            }

            .malgnplayer-progress-container {
                margin-bottom: 10px;
            }

            .malgnplayer-progress-bar {
                position: relative;
                height: 4px;
                background-color: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
                cursor: pointer;
                user-select: none;
            }

            .malgnplayer-progress-bar:active {
                cursor: grabbing;
            }

            .malgnplayer-progress-buffer {
                position: absolute;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.5);
                border-radius: 2px;
            }

            .malgnplayer-progress-played {
                position: absolute;
                height: 100%;
                background-color: #ff6b6b;
                border-radius: 2px;
                transition: width 0.1s ease;
            }

            .malgnplayer-progress-thumb {
                position: absolute;
                width: 12px;
                height: 12px;
                background-color: #ff6b6b;
                border-radius: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                opacity: 0;
                transition: opacity 0.2s ease;
            }

            .malgnplayer-progress-bar:hover .malgnplayer-progress-thumb {
                opacity: 1;
            }

            .malgnplayer-progress-tooltip {
                position: absolute;
                bottom: 100%;
                left: 0;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-family: monospace;
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.2s ease;
                pointer-events: none;
                z-index: 1000;
                margin-bottom: 8px;
            }

            .malgnplayer-progress-tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border: 4px solid transparent;
                border-top-color: rgba(0, 0, 0, 0.8);
            }

            .malgnplayer-volume-container {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .malgnplayer-volume-slider {
                width: 0;
                overflow: hidden;
                transition: width 0.3s ease;
            }

            .malgnplayer-volume-container:hover .malgnplayer-volume-slider {
                width: 80px;
            }

            .malgnplayer-volume-bar {
                position: relative;
                height: 4px;
                background-color: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
                cursor: pointer;
            }

            .malgnplayer-volume-level {
                position: absolute;
                height: 100%;
                background-color: white;
                border-radius: 2px;
                transition: width 0.1s ease;
            }

            .malgnplayer-volume-thumb {
                position: absolute;
                width: 8px;
                height: 8px;
                background-color: white;
                border-radius: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }

            .malgnplayer-time {
                font-size: 14px;
                font-family: monospace;
                min-width: 100px;
                text-align: center;
            }

            .malgnplayer-speed-btn {
                position: relative;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .malgnplayer-speed-btn svg {
                width: 20px;
                height: 20px;
            }

            .malgnplayer-speed-text {
                font-size: 12px;
                font-weight: bold;
                min-width: 20px;
                text-align: center;
            }

            /* Layer Styles */
            .malgnplayer-layer {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
                z-index: 1000;
            }

            .malgnplayer-layer-visible {
                opacity: 1;
                visibility: visible;
            }

            /* Speed Layer Styles */
            .malgnplayer-speed-menu {
                background: rgba(40, 40, 40, 0.95);
                border-radius: 8px;
                padding: 20px;
                color: white;
                min-width: 250px;
                max-height: 80vh;
                overflow-y: auto;
            }

            .malgnplayer-speed-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 15px;
                text-align: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                padding-bottom: 10px;
            }

            .malgnplayer-speed-list {
                margin-bottom: 20px;
            }

            .malgnplayer-speed-item {
                padding: 8px 15px;
                cursor: pointer;
                border-radius: 4px;
                transition: background-color 0.2s;
                margin-bottom: 2px;
            }

            .malgnplayer-speed-item:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }

            .malgnplayer-speed-item.active {
                background-color: #ff6b6b;
                color: white;
            }

            .malgnplayer-speed-custom {
                border-top: 1px solid rgba(255, 255, 255, 0.2);
                padding-top: 15px;
            }

            .malgnplayer-speed-custom-title {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 10px;
            }

            .malgnplayer-speed-input-group {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .malgnplayer-speed-input {
                flex: 1;
                padding: 8px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border-radius: 4px;
                font-size: 14px;
            }

            .malgnplayer-speed-input:focus {
                outline: none;
                border-color: #ff6b6b;
            }

            .malgnplayer-speed-apply {
                padding: 8px 16px;
                background: #ff6b6b;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
            }

            .malgnplayer-speed-apply:hover {
                background: #ff5252;
            }

            /* Subtitles Layer Styles */
            .malgnplayer-subtitles-menu {
                background: rgba(40, 40, 40, 0.95);
                border-radius: 8px;
                padding: 20px;
                color: white;
                min-width: 250px;
                max-height: 80vh;
                overflow-y: auto;
            }

            .malgnplayer-subtitles-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 15px;
                text-align: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                padding-bottom: 10px;
            }

            .malgnplayer-subtitles-list {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .malgnplayer-subtitles-item {
                padding: 8px 15px;
                cursor: pointer;
                border-radius: 4px;
                transition: background-color 0.2s;
            }

            .malgnplayer-subtitles-item:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }

            .malgnplayer-subtitles-item.active {
                background-color: #ff6b6b;
                color: white;
            }

            /* Video Area Styles */
            .malgnplayer-video-area {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 80px; /* 컨트롤 영역 제외 */
                display: flex;
                z-index: 500;
            }

            .malgnplayer-click-area {
                position: relative;
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }

            .malgnplayer-left-area {
                flex: 1;
            }

            .malgnplayer-center-area {
                flex: 2;
            }

            .malgnplayer-right-area {
                flex: 1;
            }

            /* Center Play Button */
            .malgnplayer-center-play-btn {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                opacity: 0;
                transition: opacity 0.3s ease, transform 0.3s ease;
                pointer-events: none;
                z-index: 600;
            }

            .malgnplayer-center-play-btn svg {
                width: 90px;
                height: 90px;
                filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
            }

            .malgnplayer-center-show {
                opacity: 0.9;
                animation: centerButtonShow 1s ease-out;
            }

            .malgnplayer-center-initial {
                opacity: 0.8;
                animation: centerButtonPulse 2s ease-in-out infinite;
            }


            @keyframes centerButtonShow {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                20% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1.1);
                }
                100% {
                    opacity: 0.9;
                    transform: translate(-50%, -50%) scale(1);
                }
            }

            @keyframes centerButtonPulse {
                0%, 100% {
                    opacity: 0.6;
                    transform: translate(-50%, -50%) scale(1);
                }
                50% {
                    opacity: 0.9;
                    transform: translate(-50%, -50%) scale(1.05);
                }
            }


            /* Seek Indicators */
            .malgnplayer-seek-indicator {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
                z-index: 600;
            }

            .malgnplayer-left-indicator {
                left: 30%;
            }

            .malgnplayer-right-indicator {
                right: 30%;
            }

            .malgnplayer-seek-indicator svg {
                width: 70px;
                height: 70px;
                filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
                color: rgba(255, 255, 255, 0.9);
            }

            .malgnplayer-seek-show {
                opacity: 1;
                animation: seekPulse 0.5s ease;
            }

            @keyframes seekPulse {
                0% {
                    opacity: 0;
                    transform: translateY(-50%) scale(0.8);
                }
                50% {
                    opacity: 1;
                    transform: translateY(-50%) scale(1.1);
                }
                100% {
                    opacity: 1;
                    transform: translateY(-50%) scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }

    destroy() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        if (this.speedLayer) {
            this.speedLayer.destroy();
        }
        if (this.subtitlesLayer) {
            this.subtitlesLayer.destroy();
        }
        if (this.videoArea && this.videoArea.parentNode) {
            this.videoArea.parentNode.removeChild(this.videoArea);
        }
        if (this.controls && this.controls.parentNode) {
            this.controls.parentNode.removeChild(this.controls);
        }
    }
}