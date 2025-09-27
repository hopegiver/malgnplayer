import { VideoCore } from './core/video.js';
import { Playlist } from './core/playlist.js';
import { HLSPlugin } from './plugins/hls.js';
import { DRMPlugin } from './plugins/drm.js';
import { PlayerUI } from './ui/ui.js';
import { AutoloopManager } from './core/autoloop.js';
import { SubtitleManager } from './core/subtitles.js';

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
        this.autoloop = new AutoloopManager(this);
        this.subtitles = new SubtitleManager(this);

        this.init();
    }

    init() {
        this.setupContainer();
        this.setupPlugins();
        this.setupTheme();
        this.bindEvents();
        this.setupAutoloop();

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
        this.plugins.drm = new DRMPlugin();
        this.core.addPlugin(this.plugins.hls);
        this.core.addPlugin(this.plugins.drm);
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

    setupAutoloop() {
        // Configure autoloop if enabled in config
        if (this.config.autoloop) {
            this.autoloop.setSegment(this.config.loopStartTime, this.config.loopEndTime);
            this.autoloop.enable();
        }
    }

    bindEvents() {
        this.playlist.on('playlistItem', (data) => {
            this.core.load(data.item);
        });

        this.core.on('ended', () => {
            const nextItem = this.playlist.next();
            if (nextItem) {
                this.core.load(nextItem);
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

    // DRM functionality
    getDrmInfo() {
        return this.plugins.drm ? this.plugins.drm.getDrmInfo() : null;
    }

    async renewDrmLicense() {
        if (this.plugins.drm) {
            return await this.plugins.drm.renewLicense();
        }
        throw new Error('DRM plugin not available');
    }

    isDrmProtected() {
        const drmInfo = this.getDrmInfo();
        return drmInfo !== null;
    }

    // Subtitle functionality (delegated to SubtitleManager)
    getSubtitles() {
        return this.subtitles.getSubtitles();
    }

    setSubtitle(index) {
        this.subtitles.setSubtitle(index);
        return this;
    }

    getCurrentSubtitle() {
        return this.subtitles.getCurrentSubtitle();
    }

    getSubtitleByLanguage(language) {
        return this.subtitles.getSubtitleByLanguage(language);
    }

    setSubtitleByLanguage(language) {
        return this.subtitles.setSubtitleByLanguage(language);
    }

    toggleSubtitles() {
        this.subtitles.toggleSubtitles();
        return this;
    }

    hasSubtitles() {
        return this.subtitles.hasSubtitles();
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

    // Autoloop functionality (delegated to AutoloopManager)
    async setAutoloop(enabled) {
        this.config.autoloop = enabled;

        if (enabled) {
            return this.autoloop.enable();
        } else {
            return await this.autoloop.disable();
        }
    }

    getAutoloop() {
        return this.autoloop.getStatus();
    }

    setLoopSegment(startTime, endTime) {
        this.config.loopStartTime = startTime;
        this.config.loopEndTime = endTime;
        return this.autoloop.setSegment(startTime, endTime);
    }

    getLoopSegment() {
        const status = this.autoloop.getStatus();
        return {
            startTime: status.startTime,
            endTime: status.endTime
        };
    }

    destroy() {
        // Destroy managers
        if (this.autoloop) {
            this.autoloop.destroy();
        }

        if (this.subtitles) {
            this.subtitles.destroy();
        }

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