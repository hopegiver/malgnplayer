export class AutoplayManager {
    constructor(player) {
        this.player = player;
        this.video = player.core.video;
        this.container = player.container;

        this.autoplayBlocked = false;
        this.userHasInteracted = false;
        this.waitingForInteraction = false;

        this.playButton = null;
        this.overlay = null;

        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Listen for user interactions to enable unmute
        const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];

        interactionEvents.forEach(event => {
            this.container.addEventListener(event, this.handleUserInteraction.bind(this), { once: false });
        });

        // Listen for video events
        this.video.addEventListener('play', this.handlePlayStart.bind(this));
        this.video.addEventListener('pause', this.handlePlayPause.bind(this));
    }

    async tryAutoplay() {
        if (!this.player.config.autoplay && !this.player.config.autoloop) {
            return true;
        }

        try {
            // First attempt with current settings
            await this.video.play();
            this.autoplayBlocked = false;
            this.removePlayButton();
            return true;

        } catch (error) {
            if (error.name === 'NotAllowedError') {
                console.warn('Autoplay blocked by browser policy');
                this.autoplayBlocked = true;

                // Try with muted
                if (!this.video.muted) {
                    console.log('Attempting autoplay with muted audio');
                    this.video.muted = true;

                    try {
                        await this.video.play();
                        this.autoplayBlocked = false;
                        this.showUnmuteHint();
                        return true;

                    } catch (mutedError) {
                        console.warn('Autoplay failed even with muted audio');
                        this.handleAutoplayFailure();
                        return false;
                    }
                } else {
                    this.handleAutoplayFailure();
                    return false;
                }
            } else {
                console.error('Play failed for other reason:', error);
                return false;
            }
        }
    }

    handleAutoplayFailure() {
        this.autoplayBlocked = true;
        this.waitingForInteraction = true;
        this.showPlayButton();

        // Emit event for external listeners
        if (this.player.emit) {
            this.player.emit('autoplayBlocked', {
                message: 'Autoplay was blocked by browser policy'
            });
        }
    }

    handleUserInteraction(event) {
        if (!this.userHasInteracted) {
            this.userHasInteracted = true;

            // If we were waiting for interaction, try to play
            if (this.waitingForInteraction || this.autoplayBlocked) {
                this.handleInteractionPlay();
            }

            // If video is muted and playing, show unmute option
            if (this.video.muted && !this.video.paused) {
                this.showUnmuteHint();
            }
        }
    }

    async handleInteractionPlay() {
        try {
            // Remove mute if it was only for autoplay
            if (this.video.muted && !this.player.config.muted) {
                this.video.muted = false;
            }

            await this.video.play();
            this.removePlayButton();
            this.removeUnmuteHint();
            this.waitingForInteraction = false;
            this.autoplayBlocked = false;

        } catch (error) {
            console.error('Failed to play after user interaction:', error);
        }
    }

    showPlayButton() {
        if (this.playButton) return;

        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'malgnplayer-autoplay-overlay';

        // Create play button
        this.playButton = document.createElement('button');
        this.playButton.className = 'malgnplayer-autoplay-button';
        this.playButton.innerHTML = `
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
            <div class="malgnplayer-autoplay-text">클릭하여 재생</div>
        `;

        this.playButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.handleInteractionPlay();
        });

        this.overlay.appendChild(this.playButton);
        this.container.appendChild(this.overlay);
    }

    removePlayButton() {
        if (this.overlay) {
            this.container.removeChild(this.overlay);
            this.overlay = null;
            this.playButton = null;
        }
    }

    showUnmuteHint() {
        // Don't show if user explicitly wanted muted
        if (this.player.config.muted || this.player.config.autoloop) return;

        // Remove existing hint
        this.removeUnmuteHint();

        const hint = document.createElement('div');
        hint.className = 'malgnplayer-unmute-hint';
        hint.innerHTML = `
            <button class="malgnplayer-unmute-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
                소리 켜기
            </button>
        `;

        hint.querySelector('.malgnplayer-unmute-button').addEventListener('click', (e) => {
            e.stopPropagation();
            this.video.muted = false;
            this.removeUnmuteHint();
        });

        this.container.appendChild(hint);

        // Auto-hide after 5 seconds
        setTimeout(() => this.removeUnmuteHint(), 5000);
    }

    removeUnmuteHint() {
        const hint = this.container.querySelector('.malgnplayer-unmute-hint');
        if (hint) {
            this.container.removeChild(hint);
        }
    }

    handlePlayStart() {
        // Remove play button if video starts playing
        if (this.playButton) {
            this.removePlayButton();
        }
    }

    handlePlayPause() {
        // If video is paused and we were blocked, show play button again
        if (this.autoplayBlocked && this.video.paused) {
            this.showPlayButton();
        }
    }

    // Get current autoplay status
    getStatus() {
        return {
            blocked: this.autoplayBlocked,
            userInteracted: this.userHasInteracted,
            waitingForInteraction: this.waitingForInteraction,
            videoMuted: this.video.muted
        };
    }

    // Apply autoplay-specific CSS styles
    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .malgnplayer-autoplay-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                backdrop-filter: blur(2px);
            }

            .malgnplayer-autoplay-button {
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                color: white;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
                transition: all 0.3s ease;
                min-width: 120px;
                min-height: 120px;
            }

            .malgnplayer-autoplay-button:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.6);
                transform: scale(1.05);
            }

            .malgnplayer-autoplay-text {
                margin-top: 8px;
                font-size: 14px;
                font-weight: 500;
                text-align: center;
            }

            .malgnplayer-unmute-hint {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 1001;
                animation: fadeInOut 5s ease-in-out;
            }

            .malgnplayer-unmute-button {
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 20px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                font-size: 12px;
                transition: all 0.2s ease;
            }

            .malgnplayer-unmute-button:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.6);
            }

            @keyframes fadeInOut {
                0%, 90%, 100% { opacity: 0; }
                10%, 80% { opacity: 1; }
            }

            @media (max-width: 768px) {
                .malgnplayer-autoplay-button {
                    min-width: 100px;
                    min-height: 100px;
                    padding: 16px;
                }

                .malgnplayer-autoplay-text {
                    font-size: 12px;
                }

                .malgnplayer-unmute-hint {
                    top: 8px;
                    right: 8px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    destroy() {
        this.removePlayButton();
        this.removeUnmuteHint();

        // Remove event listeners
        const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
        interactionEvents.forEach(event => {
            this.container.removeEventListener(event, this.handleUserInteraction.bind(this));
        });
    }
}