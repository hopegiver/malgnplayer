export class ThumbnailManager {
    constructor(player) {
        this.player = player;
        this.video = player.core.video;
        this.container = player.container;

        // Configuration
        this.config = {
            enabled: true,
            width: 160,
            height: 90,
            interval: 10,        // Generate thumbnail every 10 seconds
            quality: 0.8,        // Canvas export quality
            maxCache: 50,        // Maximum cached thumbnails
            preloadRadius: 3,    // Preload 3 thumbnails around current position
            ...player.config.thumbnails
        };

        // Cache system
        this.cache = new Map();
        this.preloadQueue = new Set();
        this.isGenerating = false;

        // UI elements
        this.tooltip = null;
        this.thumbnailImage = null;

        // State
        this.isEnabled = this.config.enabled && this.isCanvasSupported();
        this.videoDuration = 0;

        if (this.isEnabled) {
            this.init();
        }
    }

    init() {
        console.log('ThumbnailManager init called');
        this.createTooltip();
        this.bindEvents();
        console.log('ThumbnailManager init completed:', { tooltip: !!this.tooltip, enabled: this.isEnabled });
    }

    isCanvasSupported() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch (e) {
            return false;
        }
    }

    bindEvents() {
        // Wait for video metadata to get duration
        this.video.addEventListener('loadedmetadata', () => {
            this.videoDuration = this.video.duration;
            this.clearCache(); // Clear cache when new video loads
        });

        // Error handling
        this.video.addEventListener('error', () => {
            this.clearCache();
        });
    }

    createTooltip() {
        console.log('Creating thumbnail tooltip');
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'malgnplayer-thumbnail-tooltip';
        this.tooltip.style.display = 'none';

        // Thumbnail image
        this.thumbnailImage = document.createElement('canvas');
        this.thumbnailImage.className = 'malgnplayer-thumbnail-image';
        this.thumbnailImage.width = this.config.width;
        this.thumbnailImage.height = this.config.height;

        // Time display
        this.timeDisplay = document.createElement('div');
        this.timeDisplay.className = 'malgnplayer-thumbnail-time';

        this.tooltip.appendChild(this.thumbnailImage);
        this.tooltip.appendChild(this.timeDisplay);
        this.container.appendChild(this.tooltip);
        console.log('Thumbnail tooltip created and added to container');
    }

    async generateThumbnail(time) {
        if (!this.isEnabled || this.isGenerating) {
            return null;
        }

        const cacheKey = this.getCacheKey(time);

        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            this.isGenerating = true;

            // Check if video is ready
            if (!this.video || !this.video.videoWidth || !this.video.videoHeight) {
                throw new Error('Video not ready for thumbnail generation');
            }

            // Create canvas and capture current frame
            const canvas = document.createElement('canvas');
            canvas.width = this.config.width;
            canvas.height = this.config.height;

            const ctx = canvas.getContext('2d');

            // Draw current video frame
            ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);

            // Add time overlay to distinguish different thumbnails
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, canvas.height - 25, canvas.width, 25);
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.formatTime(time), canvas.width / 2, canvas.height - 8);

            const thumbnail = canvas;

            // Cache the thumbnail
            this.addToCache(cacheKey, thumbnail);

            this.isGenerating = false;
            return thumbnail;

        } catch (error) {
            this.isGenerating = false;
            console.warn('Failed to generate thumbnail:', error);
            return null;
        }
    }

    getCacheKey(time) {
        // Round to nearest interval for consistent caching
        return Math.floor(time / this.config.interval) * this.config.interval;
    }

    addToCache(key, thumbnail) {
        // Implement LRU cache
        if (this.cache.size >= this.config.maxCache) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, thumbnail);
    }

    clearCache() {
        this.cache.clear();
        this.preloadQueue.clear();
    }

    async preloadThumbnails(centerTime) {
        if (!this.isEnabled || this.videoDuration === 0) {
            return;
        }

        const radius = this.config.preloadRadius;
        const interval = this.config.interval;

        // Calculate range to preload
        const startTime = Math.max(0, centerTime - (radius * interval));
        const endTime = Math.min(this.videoDuration, centerTime + (radius * interval));

        // Generate preload list
        const preloadTimes = [];
        for (let time = startTime; time <= endTime; time += interval) {
            const cacheKey = this.getCacheKey(time);
            if (!this.cache.has(cacheKey) && !this.preloadQueue.has(cacheKey)) {
                preloadTimes.push(time);
                this.preloadQueue.add(cacheKey);
            }
        }

        // Preload thumbnails in background
        preloadTimes.forEach(async (time) => {
            try {
                await this.generateThumbnail(time);
                this.preloadQueue.delete(this.getCacheKey(time));
            } catch (error) {
                this.preloadQueue.delete(this.getCacheKey(time));
            }
        });
    }

    async showThumbnail(time, x, y) {
        console.log('showThumbnail called:', { time, x, y, enabled: this.isEnabled, tooltip: !!this.tooltip });

        if (!this.isEnabled || !this.tooltip) {
            console.log('showThumbnail early return:', { enabled: this.isEnabled, tooltip: !!this.tooltip });
            return;
        }

        // Update time display
        this.timeDisplay.textContent = this.formatTime(time);

        // Generate/get thumbnail
        const thumbnailCanvas = await this.generateThumbnail(time);
        console.log('thumbnailCanvas generated:', !!thumbnailCanvas);

        if (thumbnailCanvas && this.thumbnailImage) {
            // Copy canvas content directly to display canvas
            const ctx = this.thumbnailImage.getContext('2d');
            ctx.clearRect(0, 0, this.thumbnailImage.width, this.thumbnailImage.height);
            ctx.drawImage(thumbnailCanvas, 0, 0, this.thumbnailImage.width, this.thumbnailImage.height);
            console.log('thumbnail copied to display canvas');
        }

        // Position tooltip
        this.positionTooltip(x, y);
        console.log('tooltip positioned at:', { x, y });

        // Show tooltip
        this.tooltip.style.display = 'block';
        this.tooltip.style.opacity = '1';
        console.log('tooltip should be visible now');

        // Preload nearby thumbnails
        this.preloadThumbnails(time);
    }

    hideThumbnail() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
            this.tooltip.style.opacity = '0';
        }
    }

    positionTooltip(x, y) {
        if (!this.tooltip) return;

        // Use fixed dimensions to avoid getBoundingClientRect flickering
        const tooltipWidth = this.config.width + 20; // thumbnail width + padding
        const tooltipHeight = this.config.height + 40; // thumbnail height + time text + padding

        // Convert viewport coordinates to container-relative coordinates
        const containerRect = this.container.getBoundingClientRect();
        const relativeX = x - containerRect.left;
        const relativeY = y - containerRect.top;

        let left = relativeX - (tooltipWidth / 2);
        let top = relativeY - tooltipHeight - 10;

        // Keep tooltip within container bounds
        if (left < 0) {
            left = 5;
        } else if (left + tooltipWidth > this.container.offsetWidth) {
            left = this.container.offsetWidth - tooltipWidth - 5;
        }

        // Always position above the progress bar, never below
        if (top < 0) {
            top = 5;
        }

        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // API methods
    setConfig(config) {
        this.config = { ...this.config, ...config };
        this.clearCache(); // Clear cache when config changes
    }

    enable() {
        this.isEnabled = true && this.isCanvasSupported();
    }

    disable() {
        this.isEnabled = false;
        this.hideThumbnail();
        this.clearCache();
    }

    getStatus() {
        return {
            enabled: this.isEnabled,
            supported: this.isCanvasSupported(),
            cacheSize: this.cache.size,
            maxCache: this.config.maxCache,
            isGenerating: this.isGenerating
        };
    }

    // Apply thumbnail-specific CSS styles
    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .malgnplayer-thumbnail-tooltip {
                position: absolute;
                z-index: 1001;
                background: rgba(0, 0, 0, 0.9);
                border-radius: 6px;
                padding: 8px;
                pointer-events: none;
                transition: opacity 0.15s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                border: 2px solid rgba(255, 255, 255, 0.1);
                display: none;
                opacity: 0;
                will-change: transform;
                transform: translateZ(0);
            }

            .malgnplayer-thumbnail-image {
                display: block;
                border-radius: 4px;
                background: #222;
            }

            .malgnplayer-thumbnail-time {
                color: white;
                text-align: center;
                font-size: 12px;
                font-weight: 500;
                margin-top: 6px;
                font-family: Arial, sans-serif;
            }

            /* Loading state */
            .malgnplayer-thumbnail-tooltip.loading .malgnplayer-thumbnail-image {
                background: linear-gradient(45deg, #333, #555, #333);
                background-size: 200% 200%;
                animation: thumbnailLoading 1.5s ease-in-out infinite;
            }

            @keyframes thumbnailLoading {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            /* Mobile responsiveness */
            @media (max-width: 768px) {
                .malgnplayer-thumbnail-tooltip {
                    /* Hide thumbnails on mobile for performance */
                    display: none !important;
                }
            }

            /* High contrast mode */
            @media (prefers-contrast: high) {
                .malgnplayer-thumbnail-tooltip {
                    border-color: white;
                    background: black;
                }
            }
        `;

        document.head.appendChild(style);
    }

    destroy() {
        // Clear cache and queues
        this.clearCache();

        // Remove tooltip
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
            this.tooltip = null;
        }

        // Remove event listeners (handled by video element destruction)
        this.isEnabled = false;
    }
}