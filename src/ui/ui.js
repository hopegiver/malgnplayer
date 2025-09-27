import { createElement, addClass, removeClass } from '../utils/dom.js';
import { SpeedLayer } from '../ui/speedLayer.js';
import { SubtitlesLayer } from '../ui/subtitlesLayer.js';
import { Controls } from '../ui/controls.js';
import { ProgressBar } from '../ui/progressBar.js';
import { VideoInteractions } from '../ui/videoInteractions.js';

export class PlayerUI {
    constructor(player) {
        this.player = player;
        this.container = player.container;
        this.video = player.core.video;
        this.controlsVisible = false;
        this.hideTimeout = null;
        this.speedLayer = null;
        this.subtitlesLayer = null;
        this.controls = null;
        this.progressBar = null;
        this.videoInteractions = null;

        this.init();
    }

    init() {
        this.createComponents();
        this.createLayers();
        this.bindEvents();
        this.applyStyles();
        this.showInitialCenterButton();
        this.showInitialControls();
    }

    createLayers() {
        this.speedLayer = new SpeedLayer(this);
        this.subtitlesLayer = new SubtitlesLayer(this);
    }

    createComponents() {
        this.controls = new Controls(this);
        this.progressBar = new ProgressBar(this);
        this.videoInteractions = new VideoInteractions(this);

        // Insert progress bar into controls
        const controlsBottom = this.controls.controls.querySelector('.malgnplayer-controls-bottom');
        const controlsMain = controlsBottom.querySelector('.malgnplayer-controls-main');
        controlsBottom.insertBefore(this.progressBar.getElement(), controlsMain);
    }



    bindEvents() {
        // Mouse events for auto-hide
        this.container.addEventListener('mousemove', () => {
            this.showControls();
            this.resetHideTimeout();
        });

        this.container.addEventListener('mouseleave', () => {
            this.hideControls();
        });
    }


    showControls() {
        if (!this.controlsVisible) {
            addClass(this.controls.controls, 'malgnplayer-controls-visible');
            this.controlsVisible = true;
        }
    }

    hideControls() {
        if (this.controlsVisible && this.player.getState() === 'playing') {
            removeClass(this.controls.controls, 'malgnplayer-controls-visible');
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



    seek(seconds) {
        const currentTime = this.player.getPosition();
        const duration = this.player.getDuration();
        const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
        this.player.seek(newTime);
    }

    showInitialCenterButton() {
        this.videoInteractions.showInitialCenterButton();
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
                gap: 1px;
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
                padding: 15px;
                color: white;
                min-width: 120px;
                max-height: 80vh;
                overflow-y: auto;
            }


            .malgnplayer-speed-list {
                margin-bottom: 0;
            }

            .malgnplayer-speed-item {
                padding: 6px 12px;
                cursor: pointer;
                border-radius: 4px;
                transition: background-color 0.2s;
                margin-bottom: 2px;
                font-size: 14px;
                text-align: center;
            }

            .malgnplayer-speed-item:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }

            .malgnplayer-speed-item.active {
                background-color: #ff6b6b;
                color: white;
            }


            /* Subtitles Layer Styles */
            .malgnplayer-subtitles-menu {
                background: rgba(40, 40, 40, 0.95);
                border-radius: 8px;
                padding: 15px;
                color: white;
                min-width: 120px;
                max-height: 80vh;
                overflow-y: auto;
            }


            .malgnplayer-subtitles-list {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .malgnplayer-subtitles-item {
                padding: 6px 12px;
                cursor: pointer;
                border-radius: 4px;
                transition: background-color 0.2s;
                font-size: 14px;
                text-align: center;
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

            /* Mobile Optimizations */
            @media (max-width: 768px) {
                .malgnplayer-controls {
                    background: linear-gradient(transparent, rgba(0,0,0,0.8));
                }

                .malgnplayer-controls-bottom {
                    padding: 8px 12px;
                }

                .malgnplayer-btn {
                    padding: 12px;
                    min-width: 44px;
                    min-height: 44px;
                }

                .malgnplayer-btn svg {
                    width: 20px;
                    height: 20px;
                }

                .malgnplayer-progress-bar {
                    height: 6px;
                }

                .malgnplayer-progress-thumb {
                    width: 16px;
                    height: 16px;
                }

                .malgnplayer-center-play-btn svg {
                    width: 80px;
                    height: 80px;
                }

                .malgnplayer-seek-indicator svg {
                    width: 60px;
                    height: 60px;
                }

                .malgnplayer-speed-menu,
                .malgnplayer-subtitles-menu {
                    min-width: 140px;
                    padding: 20px;
                }

                .malgnplayer-speed-item,
                .malgnplayer-subtitles-item {
                    padding: 12px 16px;
                    font-size: 16px;
                }

                .malgnplayer-time {
                    font-size: 12px;
                    min-width: 80px;
                }

                .malgnplayer-volume-container:hover .malgnplayer-volume-slider {
                    width: 60px;
                }
            }

            @media (max-width: 480px) {
                .malgnplayer-controls-left,
                .malgnplayer-controls-right {
                    gap: 0px;
                }

                .malgnplayer-btn {
                    padding: 10px;
                }

                .malgnplayer-btn svg {
                    width: 18px;
                    height: 18px;
                }

                .malgnplayer-time {
                    font-size: 11px;
                    min-width: 70px;
                }

                .malgnplayer-center-play-btn svg {
                    width: 70px;
                    height: 70px;
                }

                .malgnplayer-speed-menu,
                .malgnplayer-subtitles-menu {
                    min-width: 160px;
                    max-width: 90vw;
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
        if (this.controls) {
            this.controls.destroy();
        }
        if (this.progressBar) {
            this.progressBar.destroy();
        }
        if (this.videoInteractions) {
            this.videoInteractions.destroy();
        }
    }
}