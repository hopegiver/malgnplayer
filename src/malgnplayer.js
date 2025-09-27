import { VideoCore } from './core/video.js';
import { Playlist } from './core/playlist.js';
import { HLSPlugin } from './plugins/hls.js';
import { PlayerUI } from './ui/ui.js';

export default class MalgnPlayer {
    constructor(container, config = {}) {
        if (typeof container === 'string') {
            this.container = document.getElementById(container);
        } else {
            this.container = container;
        }

        if (!this.container) {
            throw new Error('Container element not found');
        }

        this.config = {
            width: '100%',
            height: '100%',
            autoplay: false,
            muted: false,
            controls: true,
            autoloop: false,
            loopStartTime: 0,
            loopEndTime: null,
            ...config
        };

        this.core = new VideoCore(this.container, this.config);
        this.playlist = new Playlist();
        this.plugins = {};
        this.theme = null;
        this.loopMonitor = null;
        this.lastSeekTime = 0;

        this.init();
    }

    init() {
        this.setupContainer();
        this.setupPlugins();
        this.setupTheme();
        this.bindEvents();

        // Load initial media if provided
        this.loadInitialMedia();
    }

    loadInitialMedia() {
        // Check for sources first (playlist)
        if (this.config.sources) {
            this.load({ sources: this.config.sources });
        }
        // Check for playlist (backward compatibility)
        else if (this.config.playlist) {
            this.load(this.config.playlist);
        }
        // Check for single file
        else if (this.config.file) {
            const source = {
                file: this.config.file
            };

            // Add optional properties if provided
            if (this.config.type) source.type = this.config.type;
            if (this.config.title) source.title = this.config.title;
            if (this.config.poster) source.poster = this.config.poster;

            this.load(source);
        }
    }

    setupContainer() {
        this.container.style.position = 'relative';
        this.container.style.width = this.config.width;
        this.container.style.height = this.config.height;
        this.container.style.overflow = 'hidden';
    }

    setupPlugins() {
        this.plugins.hls = new HLSPlugin();
        this.core.addPlugin(this.plugins.hls);
    }

    setupTheme() {
        // Don't show controls in autoloop mode
        if (this.config.controls && !this.config.autoloop) {
            this.theme = new PlayerUI(this);
        }

        // Hide native video controls if using custom UI or in autoloop mode
        if (this.theme || this.config.autoloop) {
            this.core.video.controls = false;
        }
    }

    bindEvents() {
        this.playlist.on('playlistItem', (data) => {
            this.core.load(data.item);
        });

        this.core.on('ended', () => {
            if (this.config.autoloop) {
                this.smoothRestart();
            } else {
                const nextItem = this.playlist.next();
                if (nextItem) {
                    this.core.load(nextItem);
                }
            }
        });

        // Setup autoloop when playing starts
        this.core.on('playing', () => {
            console.log('Playing event triggered, autoloop:', this.config.autoloop);
            if (this.config.autoloop) {
                console.log('Starting seamless loop');
                this.startSeamlessLoop();
            }
        });

        // Clear autoloop when paused
        this.core.on('pause', () => {
            this.stopSeamlessLoop();
        });

        // Monitor time updates for seamless looping
        this.core.on('timeupdate', (data) => {
            if (this.config.autoloop && this.loopMonitor) {
                this.checkLoopPoint(data.currentTime);
            }
        });

        // Setup autoloop behavior after loading
        this.core.on('loadeddata', () => {
            if (this.config.autoloop) {
                // Auto-start playback in autoloop mode
                this.core.video.muted = true; // Ensure muted for autoplay
                this.core.video.loop = false; // Always use custom seamless loop
                this.play();
            }
        });
    }

    async load(source) {
        if (Array.isArray(source)) {
            this.playlist.load(source);
            const firstItem = this.playlist.getCurrentItem();
            if (firstItem) {
                await this.core.load(firstItem);
            }
        } else if (source && source.sources) {
            this.playlist.load(source.sources);
            const firstItem = this.playlist.getCurrentItem();
            if (firstItem) {
                await this.core.load(firstItem);
            }
        } else {
            this.playlist.load([source]);
            await this.core.load(source);
        }
        return this;
    }

    play() {
        return this.core.play();
    }

    pause() {
        this.core.pause();
        return this;
    }

    stop() {
        this.core.stop();
        return this;
    }

    seek(time) {
        this.core.seek(time);
        return this;
    }

    setVolume(volume) {
        this.core.setVolume(volume);
        return this;
    }

    setMute(muted) {
        this.core.setMute(muted);
        return this;
    }

    getState() {
        return this.core.getState();
    }

    getPosition() {
        return this.core.getCurrentTime();
    }

    getDuration() {
        return this.core.getDuration();
    }

    getVolume() {
        return this.core.getVolume();
    }

    getMute() {
        return this.core.getMute();
    }

    getPlaylist() {
        return this.playlist.getPlaylist();
    }

    getPlaylistIndex() {
        return this.playlist.getPlaylistIndex();
    }

    async playlistItem(index) {
        const item = this.playlist.playItem(index);
        if (item) {
            await this.core.load(item);
        }
        return this;
    }

    async playlistNext() {
        const nextItem = this.playlist.next();
        if (nextItem) {
            await this.core.load(nextItem);
        }
        return this;
    }

    async playlistPrev() {
        const prevItem = this.playlist.previous();
        if (prevItem) {
            await this.core.load(prevItem);
        }
        return this;
    }

    addPlaylistItem(item) {
        this.playlist.addItem(item);
        return this;
    }

    removePlaylistItem(index) {
        this.playlist.removeItem(index);
        return this;
    }

    on(event, callback) {
        this.core.on(event, callback);
        return this;
    }

    off(event, callback) {
        this.core.off(event, callback);
        return this;
    }

    once(event, callback) {
        this.core.once(event, callback);
        return this;
    }

    remove() {
        this.destroy();
    }

    destroy() {
        if (this.theme && this.theme.destroy) {
            this.theme.destroy();
        }

        this.core.destroy();

        Object.values(this.plugins).forEach(plugin => {
            if (plugin.destroy) {
                plugin.destroy();
            }
        });

        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    getQualityLevels() {
        return this.plugins.hls ? this.plugins.hls.getLevels() : [];
    }

    getCurrentQuality() {
        return this.plugins.hls ? this.plugins.hls.getCurrentLevel() : -1;
    }

    setCurrentQuality(level) {
        if (this.plugins.hls) {
            this.plugins.hls.setCurrentLevel(level);
        }
        return this;
    }

    setControls(enabled) {
        if (this.core.video) {
            this.core.video.controls = enabled;
        }
        return this;
    }

    resize(width, height) {
        if (width) this.container.style.width = width;
        if (height) this.container.style.height = height;
        return this;
    }

    setPlaybackRate(rate) {
        if (this.core.video) {
            this.core.video.playbackRate = rate;
        }
        return this;
    }

    getPlaybackRate() {
        return this.core.video ? this.core.video.playbackRate : 1;
    }

    getSubtitles() {
        if (!this.core.video || !this.core.video.textTracks) {
            return [];
        }

        const subtitles = [];
        const seenLanguages = new Set();

        for (let i = 0; i < this.core.video.textTracks.length; i++) {
            const track = this.core.video.textTracks[i];
            if (track.kind === 'subtitles' || track.kind === 'captions') {
                // Skip forced subtitles
                const label = track.label || '';
                if (label.toLowerCase().includes('forced')) {
                    continue;
                }

                const key = track.language + label;
                if (!seenLanguages.has(key)) {
                    seenLanguages.add(key);
                    subtitles.push({
                        label: label,
                        language: track.language,
                        kind: track.kind,
                        index: i
                    });
                }
            }
        }
        return subtitles;
    }

    setSubtitle(index) {
        if (!this.core.video || !this.core.video.textTracks) {
            return this;
        }

        // Disable all text tracks first
        for (let i = 0; i < this.core.video.textTracks.length; i++) {
            this.core.video.textTracks[i].mode = 'disabled';
        }

        // Enable the selected track
        if (index !== null && index >= 0 && index < this.core.video.textTracks.length) {
            this.core.video.textTracks[index].mode = 'showing';
        }

        return this;
    }

    getCurrentSubtitle() {
        if (!this.core.video || !this.core.video.textTracks) {
            return null;
        }

        for (let i = 0; i < this.core.video.textTracks.length; i++) {
            if (this.core.video.textTracks[i].mode === 'showing') {
                return i;
            }
        }
        return null;
    }

    setPoster(posterUrl) {
        if (this.core.video) {
            if (posterUrl) {
                this.core.video.poster = posterUrl;
            } else {
                this.core.video.removeAttribute('poster');
            }
        }
        return this;
    }

    getPoster() {
        return this.core.video ? this.core.video.poster : null;
    }

    // Additional utility functions
    isPlaying() {
        return this.getState() === 'playing';
    }

    isPaused() {
        return this.getState() === 'paused';
    }

    isEnded() {
        return this.getState() === 'ended';
    }

    isIdle() {
        return this.getState() === 'idle';
    }

    getBuffer() {
        if (!this.core.video || !this.core.video.buffered || this.core.video.buffered.length === 0) {
            return 0;
        }

        const buffered = this.core.video.buffered;
        const duration = this.getDuration();

        if (duration > 0) {
            return (buffered.end(buffered.length - 1) / duration) * 100;
        }

        return 0;
    }

    getCurrentTime() {
        return this.getPosition();
    }

    setCurrentTime(time) {
        return this.seek(time);
    }

    getVideoElement() {
        return this.core.video;
    }

    getContainer() {
        return this.container;
    }

    getConfig() {
        return { ...this.config };
    }

    // Convenience methods for common operations
    togglePlay() {
        if (this.isPlaying()) {
            this.pause();
        } else {
            this.play();
        }
        return this;
    }

    rewind(seconds = 10) {
        const currentTime = this.getCurrentTime();
        this.seek(Math.max(0, currentTime - seconds));
        return this;
    }

    fastForward(seconds = 10) {
        const currentTime = this.getCurrentTime();
        const duration = this.getDuration();
        this.seek(Math.min(duration, currentTime + seconds));
        return this;
    }

    restart() {
        this.seek(0);
        return this;
    }

    // Autoloop functionality (always seamless)

    startSeamlessLoop() {
        console.log('startSeamlessLoop called');
        if (!this.core.video) {
            console.log('No video element found');
            return;
        }

        this.loopMonitor = true;
        console.log('Loop monitor enabled');

        // Calculate loop end time if not specified
        if (this.config.loopEndTime === null) {
            const duration = this.getDuration();
            console.log('Video duration:', duration);
            if (duration > 0) {
                this.config.loopEndTime = duration; // Default to full video
            }
        }

        console.log(`Loop configuration: start=${this.config.loopStartTime}s, end=${this.config.loopEndTime}s`);

        // If we have a custom start time, seek to it initially
        const startTime = this.config.loopStartTime || 0;
        if (startTime > 0 && this.core.video.currentTime < startTime) {
            console.log(`Starting seamless loop from ${startTime}s to ${this.config.loopEndTime}s`);
            this.seamlessSeek(startTime);
        } else {
            console.log(`Current time ${this.core.video.currentTime}s is already at or past start time ${startTime}s`);
        }
    }

    stopSeamlessLoop() {
        this.loopMonitor = false;
    }

    checkLoopPoint(currentTime) {
        if (!this.config.autoloop || !this.loopMonitor) return;

        const endTime = this.config.loopEndTime || this.getDuration();
        const startTime = this.config.loopStartTime || 0;

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
        if (!this.core.video) return;

        try {
            const video = this.core.video;
            console.log(`Seamless seeking from ${video.currentTime.toFixed(2)}s to ${time}s, readyState: ${video.readyState}`);

            // Ensure video is ready for seeking
            if (video.readyState >= 2) { // HAVE_CURRENT_DATA
                video.currentTime = time;
                console.log(`Seek completed, new currentTime: ${video.currentTime.toFixed(2)}s`);
            } else {
                console.warn('Video not ready for seeking, waiting...');
                // Try again after a short delay
                setTimeout(() => {
                    if (this.config.autoloop && this.loopMonitor) {
                        this.seamlessSeek(time);
                    }
                }, 50);
            }
        } catch (error) {
            console.warn('Seamless seek failed:', error);
            // Fallback to regular seek
            this.seek(time);
        }
    }

    async setAutoloop(enabled) {
        console.log(`setAutoloop called: enabled=${enabled}`);
        this.config.autoloop = enabled;

        if (enabled) {
            // Hide controls and ensure muted
            if (this.theme && this.theme.destroy) {
                this.theme.destroy();
                this.theme = null;
            }
            this.core.video.controls = false;
            this.core.video.muted = true;
            this.core.video.loop = false; // Always use our custom seamless loop

            console.log(`Autoloop enabled. IsPlaying: ${this.isPlaying()}`);
            if (this.isPlaying()) {
                console.log('Starting seamless autoloop');
                this.startSeamlessLoop();
            } else {
                console.log('Video not playing, waiting for play event');
            }
        } else {
            // Disable autoloop and restore controls if needed
            this.stopSeamlessLoop();
            this.core.video.loop = false;
            if (this.config.controls && !this.theme) {
                const { PlayerUI } = await import('./ui/ui.js');
                this.theme = new PlayerUI(this);
                this.core.video.controls = false;
            }
        }

        return this;
    }

    getAutoloop() {
        return {
            enabled: this.config.autoloop,
            startTime: this.config.loopStartTime,
            endTime: this.config.loopEndTime
        };
    }

    setLoopSegment(startTime, endTime) {
        this.config.loopStartTime = Math.max(0, startTime || 0);
        this.config.loopEndTime = endTime;

        console.log(`Loop segment set: ${this.config.loopStartTime}s to ${this.config.loopEndTime}s`);

        // Restart seamless loop if currently active
        if (this.config.autoloop && this.loopMonitor) {
            this.stopSeamlessLoop();
            this.startSeamlessLoop();
        }

        return this;
    }

    getLoopSegment() {
        return {
            startTime: this.config.loopStartTime,
            endTime: this.config.loopEndTime
        };
    }

    destroy() {
        // Clear seamless loop
        this.stopSeamlessLoop();

        if (this.theme && this.theme.destroy) {
            this.theme.destroy();
        }

        this.core.destroy();

        Object.values(this.plugins).forEach(plugin => {
            if (plugin.destroy) {
                plugin.destroy();
            }
        });

        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}