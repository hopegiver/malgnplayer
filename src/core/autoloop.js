import { EventEmitter } from '../utils/events.js';

export class AutoloopManager extends EventEmitter {
    constructor(player) {
        super();
        this.player = player;
        this.config = {
            enabled: false,
            startTime: 0,
            endTime: null
        };
        this.monitor = null;
        this.lastSeekTime = 0;

        this.bindEvents();
    }

    bindEvents() {
        // Setup autoloop when playing starts
        this.player.core.on('playing', () => {
            if (this.config.enabled) {
                console.log('Starting seamless loop');
                this.startLoop();
            }
        });

        // Clear autoloop when paused
        this.player.core.on('pause', () => {
            this.stopLoop();
        });

        // Monitor time updates for seamless looping
        this.player.core.on('timeupdate', (data) => {
            if (this.config.enabled && this.monitor) {
                this.checkLoopPoint(data.currentTime);
            }
        });

        // Setup autoloop behavior after loading
        this.player.core.on('loadeddata', () => {
            if (this.config.enabled) {
                // Auto-start playback in autoloop mode
                this.player.core.video.muted = true; // Ensure muted for autoplay
                this.player.core.video.loop = false; // Always use custom seamless loop
                this.player.play();
            }
        });
    }

    enable() {
        console.log('Autoloop enabled');
        this.config.enabled = true;

        // Hide controls and ensure muted
        if (this.player.theme && this.player.theme.destroy) {
            this.player.theme.destroy();
            this.player.theme = null;
        }

        if (this.player.core.video) {
            this.player.core.video.controls = false;
            this.player.core.video.muted = true;
            this.player.core.video.loop = false; // Always use our custom seamless loop
        }

        console.log(`Autoloop enabled. IsPlaying: ${this.player.isPlaying()}`);
        if (this.player.isPlaying()) {
            console.log('Starting seamless autoloop');
            this.startLoop();
        } else {
            console.log('Video not playing, waiting for play event');
        }

        return this.player;
    }

    async disable() {
        console.log('Autoloop disabled');
        this.config.enabled = false;

        // Disable autoloop and restore controls if needed
        this.stopLoop();

        if (this.player.core.video) {
            this.player.core.video.loop = false;
        }

        if (this.player.config.controls && !this.player.theme) {
            const { PlayerUI } = await import('../ui/playerUI.js');
            this.player.theme = new PlayerUI(this.player);
            this.player.core.video.controls = false;
        }

        return this.player;
    }

    setSegment(startTime, endTime) {
        this.config.startTime = Math.max(0, startTime || 0);
        this.config.endTime = endTime;

        // Update player config as well for consistency
        this.player.config.loopStartTime = this.config.startTime;
        this.player.config.loopEndTime = this.config.endTime;

        console.log(`Loop segment set: ${this.config.startTime}s to ${this.config.endTime}s`);

        // Restart seamless loop if currently active
        if (this.config.enabled && this.monitor) {
            this.stopLoop();
            this.startLoop();
        }

        return this.player;
    }

    getStatus() {
        return {
            enabled: this.config.enabled,
            startTime: this.config.startTime,
            endTime: this.config.endTime
        };
    }

    startLoop() {
        console.log('startLoop called');
        if (!this.player.core.video) {
            console.log('No video element found');
            return;
        }

        this.monitor = true;
        console.log('Loop monitor enabled');

        // Calculate loop end time if not specified
        if (this.config.endTime === null) {
            const duration = this.player.getDuration();
            console.log('Video duration:', duration);
            if (duration > 0) {
                this.config.endTime = duration; // Default to full video
            }
        }

        console.log(`Loop configuration: start=${this.config.startTime}s, end=${this.config.endTime}s`);

        // If we have a custom start time, seek to it initially
        const startTime = this.config.startTime || 0;
        if (startTime > 0 && this.player.core.video.currentTime < startTime) {
            console.log(`Starting seamless loop from ${startTime}s to ${this.config.endTime}s`);
            this.seamlessSeek(startTime);
        } else {
            console.log(`Current time ${this.player.core.video.currentTime}s is already at or past start time ${startTime}s`);
        }
    }

    stopLoop() {
        this.monitor = false;
        console.log('Loop monitor disabled');
    }

    checkLoopPoint(currentTime) {
        if (!this.config.enabled || !this.monitor) return;

        const endTime = this.config.endTime || this.player.getDuration();
        const startTime = this.config.startTime || 0;

        // Add some tolerance to prevent too frequent seeking
        const tolerance = 0.1; // 100ms tolerance
        const now = Date.now();

        // Prevent seeking too frequently (debounce)
        if (now - this.lastSeekTime < 500) { // 500ms debounce
            return;
        }

        // Check if we've reached the loop end point
        if (currentTime >= (endTime - tolerance)) {
            console.log(`Loop point reached: ${currentTime.toFixed(2)}s >= ${endTime}s, seeking to ${startTime}s`);
            this.lastSeekTime = now;
            this.seamlessSeek(startTime);
        }
    }

    seamlessSeek(time) {
        if (!this.player.core.video) return;

        try {
            const video = this.player.core.video;
            console.log(`Seamless seeking from ${video.currentTime.toFixed(2)}s to ${time}s, readyState: ${video.readyState}`);

            // Ensure video is ready for seeking
            if (video.readyState >= 2) { // HAVE_CURRENT_DATA
                video.currentTime = time;
                console.log(`Seek completed, new currentTime: ${video.currentTime.toFixed(2)}s`);
            } else {
                console.warn('Video not ready for seeking, waiting...');
                // Try again after a short delay
                setTimeout(() => {
                    if (this.config.enabled && this.monitor) {
                        this.seamlessSeek(time);
                    }
                }, 50);
            }
        } catch (error) {
            console.warn('Seamless seek failed:', error);
            // Fallback to regular seek
            this.player.seek(time);
        }
    }

    destroy() {
        console.log('Destroying autoloop manager');
        this.stopLoop();
        this.removeAllListeners();
    }
}