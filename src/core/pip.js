export class PictureInPictureManager {
    constructor(player) {
        this.player = player;
        this.video = player.core.video;
        this.container = player.container;

        this.isSupported = false;
        this.isActive = false;
        this.pipButton = null;

        this.init();
    }

    init() {
        this.checkSupport();
        this.bindEvents();
    }

    checkSupport() {
        // Check if PiP is supported
        this.isSupported = document.pictureInPictureEnabled &&
                          'requestPictureInPicture' in HTMLVideoElement.prototype;

        if (!this.isSupported) {
            console.warn('Picture-in-Picture is not supported in this browser');
            return;
        }

        // Check if PiP is allowed (not disabled by user/policy)
        if (document.pictureInPictureEnabled === false) {
            console.warn('Picture-in-Picture is disabled by user or policy');
            this.isSupported = false;
        }
    }

    bindEvents() {
        if (!this.isSupported) return;

        // Listen for PiP events
        this.video.addEventListener('enterpictureinpicture', this.handleEnterPiP.bind(this));
        this.video.addEventListener('leavepictureinpicture', this.handleLeavePiP.bind(this));

        // Listen for document visibility changes
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // Keyboard shortcut (P key)
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    async enterPictureInPicture() {
        if (!this.isSupported) {
            throw new Error('Picture-in-Picture is not supported');
        }

        if (this.isActive) {
            console.warn('Already in Picture-in-Picture mode');
            return false;
        }

        try {
            await this.video.requestPictureInPicture();
            return true;
        } catch (error) {
            console.error('Failed to enter Picture-in-Picture:', error);

            // Emit error event
            if (this.player.emit) {
                this.player.emit('pipError', {
                    type: 'enter_failed',
                    message: error.message,
                    error: error
                });
            }

            throw error;
        }
    }

    async exitPictureInPicture() {
        if (!this.isSupported) {
            throw new Error('Picture-in-Picture is not supported');
        }

        if (!this.isActive) {
            console.warn('Not in Picture-in-Picture mode');
            return false;
        }

        try {
            await document.exitPictureInPicture();
            return true;
        } catch (error) {
            console.error('Failed to exit Picture-in-Picture:', error);

            if (this.player.emit) {
                this.player.emit('pipError', {
                    type: 'exit_failed',
                    message: error.message,
                    error: error
                });
            }

            throw error;
        }
    }

    async togglePictureInPicture() {
        if (!this.isSupported) {
            throw new Error('Picture-in-Picture is not supported');
        }

        try {
            if (this.isActive) {
                await this.exitPictureInPicture();
            } else {
                await this.enterPictureInPicture();
            }
            return this.isActive;
        } catch (error) {
            throw error;
        }
    }

    handleEnterPiP(event) {
        this.isActive = true;

        // Update button state
        this.updateButtonState();

        // Hide player controls in PiP mode (optional)
        if (this.player.theme && this.player.theme.controls) {
            this.player.theme.hideControls();
        }

        // Emit event
        if (this.player.emit) {
            this.player.emit('pipenter', {
                width: event.target.videoWidth,
                height: event.target.videoHeight
            });
        }

        console.log('Entered Picture-in-Picture mode');
    }

    handleLeavePiP(event) {
        this.isActive = false;

        // Update button state
        this.updateButtonState();

        // Show player controls again (optional)
        if (this.player.theme && this.player.theme.controls) {
            this.player.theme.showControls();
        }

        // Emit event
        if (this.player.emit) {
            this.player.emit('pipexit', {
                width: event.target.videoWidth,
                height: event.target.videoHeight
            });
        }

        console.log('Left Picture-in-Picture mode');
    }

    handleVisibilityChange() {
        // Auto-enter PiP when tab becomes hidden (optional feature)
        if (this.player.config.pipAutoEnter && document.hidden && !this.isActive) {
            if (this.video && !this.video.paused) {
                this.enterPictureInPicture().catch(() => {
                    // Silently fail if user hasn't interacted yet
                });
            }
        }
    }

    handleKeydown(event) {
        // Check if the player container is focused or mouse is over it
        const isPlayerFocused = this.container.contains(document.activeElement) ||
                               this.container.matches(':hover');

        if (!isPlayerFocused) return;

        // P key for Picture-in-Picture
        if (event.key === 'p' || event.key === 'P') {
            event.preventDefault();
            this.togglePictureInPicture().catch(console.error);
        }
    }

    updateButtonState() {
        if (!this.pipButton) return;

        if (this.isActive) {
            this.pipButton.classList.add('malgnplayer-pip-active');
            this.pipButton.title = 'Exit Picture-in-Picture (P)';
        } else {
            this.pipButton.classList.remove('malgnplayer-pip-active');
            this.pipButton.title = 'Picture-in-Picture (P)';
        }
    }

    // Get PiP status
    getStatus() {
        return {
            supported: this.isSupported,
            active: this.isActive,
            available: this.isSupported && !this.isActive
        };
    }

    // Create PiP button element
    createButton() {
        if (!this.isSupported) return null;

        const button = document.createElement('button');
        button.className = 'malgnplayer-btn malgnplayer-pip-btn';
        button.title = 'Picture-in-Picture (P)';
        button.innerHTML = this.getPipIcon();

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePictureInPicture().catch(console.error);
        });

        this.pipButton = button;
        return button;
    }

    getPipIcon() {
        return `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 7h-8v6h8V7zm-2 4h-4V9h4v2zm4-8H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h3v-2H3V5h18v8h2V5c0-1.1-.9-2-2-2z"/>
                <path d="M15 13h6v6h-6z"/>
            </svg>
        `;
    }

    getExitPipIcon() {
        return `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 7h-8v6h8V7zm-2 4h-4V9h4v2zm4-8H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h3v-2H3V5h18v8h2V5c0-1.1-.9-2-2-2z"/>
                <path d="M15 13h6v6h-6z" fill="none" stroke="currentColor" stroke-width="2"/>
                <path d="m17 15 2 2m0-2-2 2" stroke="currentColor" stroke-width="1.5"/>
            </svg>
        `;
    }

    // Apply PiP-specific styles
    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .malgnplayer-pip-btn {
                position: relative;
            }

            .malgnplayer-pip-btn.malgnplayer-pip-active {
                background-color: rgba(255, 107, 107, 0.2);
                color: #ff6b6b;
            }

            .malgnplayer-pip-btn:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }

            .malgnplayer-pip-btn.malgnplayer-pip-active:hover {
                background-color: rgba(255, 107, 107, 0.3);
            }

            /* Hide PiP button if not supported */
            .malgnplayer-pip-btn[data-unsupported="true"] {
                display: none;
            }

            /* PiP status indicator */
            .malgnplayer-pip-active::after {
                content: '';
                position: absolute;
                top: 2px;
                right: 2px;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background-color: #ff6b6b;
                animation: pipPulse 2s ease-in-out infinite;
            }

            @keyframes pipPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            /* Mobile responsiveness */
            @media (max-width: 768px) {
                .malgnplayer-pip-btn {
                    min-width: 44px;
                    min-height: 44px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    destroy() {
        // Exit PiP if active
        if (this.isActive) {
            this.exitPictureInPicture().catch(() => {});
        }

        // Remove event listeners
        if (this.isSupported) {
            this.video.removeEventListener('enterpictureinpicture', this.handleEnterPiP.bind(this));
            this.video.removeEventListener('leavepictureinpicture', this.handleLeavePiP.bind(this));
            document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
            document.removeEventListener('keydown', this.handleKeydown.bind(this));
        }

        this.pipButton = null;
    }
}