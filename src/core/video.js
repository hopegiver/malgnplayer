import { EventEmitter } from '../utils/events.js';

export class VideoCore extends EventEmitter {
    constructor(container, config = {}) {
        super();
        this.container = container;
        this.config = config;
        this.video = null;
        this.currentSource = null;
        this.plugins = [];

        this.init();
    }

    init() {
        this.createVideoElement();
        this.bindEvents();
    }

    createVideoElement() {
        this.video = document.createElement('video');
        this.video.style.width = '100%';
        this.video.style.height = '100%';
        this.video.style.objectFit = 'cover';

        if (this.config.controls !== false) {
            this.video.controls = true;
        }

        if (this.config.muted) {
            this.video.muted = true;
        }

        if (this.config.autoplay) {
            this.video.autoplay = true;
        }

        this.container.appendChild(this.video);
    }

    bindEvents() {
        const events = [
            'loadstart', 'loadeddata', 'loadedmetadata', 'canplay', 'canplaythrough',
            'play', 'pause', 'ended', 'error', 'timeupdate', 'progress', 'volumechange',
            'seeking', 'seeked', 'waiting', 'playing'
        ];

        events.forEach(event => {
            this.video.addEventListener(event, (e) => {
                this.emit(event, {
                    type: event,
                    originalEvent: e,
                    currentTime: this.video.currentTime,
                    duration: this.video.duration,
                    volume: this.video.volume,
                    muted: this.video.muted,
                    paused: this.video.paused
                });
            });
        });
    }

    async load(source) {
        if (typeof source === 'string') {
            this.currentSource = { file: source };
        } else {
            this.currentSource = source;
        }

        // Clean up any existing plugins before loading new source
        this.plugins.forEach(plugin => {
            if (plugin.destroy) {
                plugin.destroy();
            }
        });

        // Set poster image if provided
        if (this.currentSource.poster) {
            this.video.poster = this.currentSource.poster;
        } else {
            this.video.removeAttribute('poster');
        }

        // Find applicable plugins
        const applicablePlugins = this.plugins.filter(plugin =>
            plugin.canPlay && plugin.canPlay(this.currentSource)
        );

        if (applicablePlugins.length > 0) {
            try {
                // Load DRM plugin first if applicable
                const drmPlugin = applicablePlugins.find(plugin => plugin.constructor.name === 'DRMPlugin');
                if (drmPlugin) {
                    await drmPlugin.load(this.currentSource, this.video);
                }

                // Then load other plugins (HLS, etc.)
                const otherPlugins = applicablePlugins.filter(plugin => plugin.constructor.name !== 'DRMPlugin');
                for (const plugin of otherPlugins) {
                    await plugin.load(this.currentSource, this.video);
                }
            } catch (error) {
                console.error('Plugin load error:', error);
                // Fallback to native video loading
                this.video.src = this.currentSource.file;
                this.video.load();
            }
        } else {
            // Clear any existing src attribute first
            this.video.removeAttribute('src');
            this.video.innerHTML = '';

            // Handle native video loading with optional type
            if (this.currentSource.type && this.isVideoType(this.currentSource.type)) {
                this.loadVideoWithType(this.currentSource);
            } else {
                this.video.src = this.currentSource.file;
                this.video.load();
            }
        }
    }

    isVideoType(type) {
        const videoTypes = [
            'mp4', 'video/mp4',
            'webm', 'video/webm',
            'ogg', 'video/ogg',
            'avi', 'video/x-msvideo',
            'mov', 'video/quicktime',
            'mkv', 'video/x-matroska'
        ];
        return videoTypes.includes(type.toLowerCase());
    }

    loadVideoWithType(source) {
        // Clear existing source elements
        this.video.innerHTML = '';

        // Create source element with type
        const sourceElement = document.createElement('source');
        sourceElement.src = source.file;

        // Map common type aliases to proper MIME types
        const typeMapping = {
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'ogg': 'video/ogg',
            'avi': 'video/x-msvideo',
            'mov': 'video/quicktime',
            'mkv': 'video/x-matroska'
        };

        const mimeType = typeMapping[source.type.toLowerCase()] || source.type;
        sourceElement.type = mimeType;

        this.video.appendChild(sourceElement);
        this.video.load();
    }

    play() {
        return this.video.play();
    }

    pause() {
        this.video.pause();
    }

    stop() {
        this.pause();
        this.video.currentTime = 0;
    }

    seek(time) {
        this.video.currentTime = time;
    }

    setVolume(volume) {
        this.video.volume = Math.max(0, Math.min(1, volume));
    }

    setMute(muted) {
        this.video.muted = muted;
    }

    getState() {
        if (this.video.ended) return 'idle';
        if (this.video.paused) return 'paused';
        if (this.video.readyState < 3) return 'buffering';
        return 'playing';
    }

    getCurrentTime() {
        return this.video.currentTime;
    }

    getDuration() {
        return this.video.duration || 0;
    }

    getVolume() {
        return this.video.volume;
    }

    getMute() {
        return this.video.muted;
    }

    addPlugin(plugin) {
        plugin.init(this);
        this.plugins.push(plugin);
    }

    destroy() {
        this.plugins.forEach(plugin => {
            if (plugin.destroy) {
                plugin.destroy();
            }
        });

        if (this.video && this.video.parentNode) {
            this.video.parentNode.removeChild(this.video);
        }

        this.events = {};
    }
}