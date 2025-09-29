export class HLSPlugin {
    constructor() {
        this.hls = null;
        this.video = null;
        this.core = null;
        this.hlsLoaded = false;
    }

    init(core) {
        this.core = core;
    }

    canPlay(source) {
        if (!source || !source.file) return false;

        // Check explicit type first
        if (source.type) {
            const type = source.type.toLowerCase();
            return type === 'hls' ||
                   type === 'm3u8' ||
                   type === 'application/x-mpegurl' ||
                   type === 'application/vnd.apple.mpegurl';
        }

        // Fallback to file extension detection
        const url = source.file.toLowerCase();
        return url.includes('.m3u8') || url.includes('application/x-mpegURL');
    }

    async loadHlsLibrary() {
        if (this.hlsLoaded || window.Hls) {
            this.hlsLoaded = true;
            return window.Hls;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
            script.onload = () => {
                this.hlsLoaded = true;
                resolve(window.Hls);
            };
            script.onerror = () => {
                reject(new Error('Failed to load HLS library from CDN'));
            };
            document.head.appendChild(script);
        });
    }

    async load(source, videoElement) {
        this.video = videoElement;

        // Load HLS library dynamically
        try {
            await this.loadHlsLibrary();
        } catch (error) {
            throw new Error('Failed to load HLS library: ' + error.message);
        }

        const Hls = window.Hls;

        if (!Hls.isSupported()) {
            if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
                this.video.src = source.file;
                this.video.load();
                return;
            }
            throw new Error('HLS is not supported in this browser');
        }

        if (this.hls) {
            this.hls.destroy();
        }

        this.hls = new window.Hls({
            enableWorker: false,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        this.hls.loadSource(source.file);
        this.hls.attachMedia(this.video);

        this.hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            if (this.core) {
                this.core.emit('hlsManifestParsed', {
                    levels: this.hls.levels
                });
            }
        });

        this.hls.on(window.Hls.Events.ERROR, (event, data) => {
            if (this.core) {
                this.core.emit('hlsError', {
                    type: data.type,
                    details: data.details,
                    fatal: data.fatal
                });
            }

            if (data.fatal) {
                switch (data.type) {
                    case window.Hls.ErrorTypes.NETWORK_ERROR:
                        this.hls.startLoad();
                        break;
                    case window.Hls.ErrorTypes.MEDIA_ERROR:
                        this.hls.recoverMediaError();
                        break;
                    default:
                        this.hls.destroy();
                        break;
                }
            }
        });

        this.hls.on(window.Hls.Events.LEVEL_SWITCHED, (event, data) => {
            if (this.core) {
                this.core.emit('hlsLevelSwitched', {
                    level: data.level
                });
            }
        });
    }

    getLevels() {
        return this.hls && this.hlsLoaded ? this.hls.levels : [];
    }

    getCurrentLevel() {
        return this.hls && this.hlsLoaded ? this.hls.currentLevel : -1;
    }

    setCurrentLevel(level) {
        if (this.hls && this.hlsLoaded) {
            this.hls.currentLevel = level;
        }
    }

    setAutoLevelEnabled(enabled) {
        if (this.hls && this.hlsLoaded) {
            this.hls.autoLevelEnabled = enabled;
        }
    }

    destroy() {
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
    }
}