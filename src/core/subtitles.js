import { EventEmitter } from '../utils/events.js';

export class SubtitleManager extends EventEmitter {
    constructor(player) {
        super();
        this.player = player;
        this.currentSubtitle = null;
    }

    /**
     * Get all available subtitles/captions
     * @returns {Array} Array of subtitle objects
     */
    getSubtitles() {
        if (!this.player.core.video || !this.player.core.video.textTracks) {
            return [];
        }

        const subtitles = [];
        const seenLanguages = new Set();

        for (let i = 0; i < this.player.core.video.textTracks.length; i++) {
            const track = this.player.core.video.textTracks[i];
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

    /**
     * Set active subtitle track
     * @param {number|null} index - Track index or null to disable
     * @returns {SubtitleManager} this
     */
    setSubtitle(index) {
        if (!this.player.core.video || !this.player.core.video.textTracks) {
            return this;
        }

        // Disable all text tracks first
        for (let i = 0; i < this.player.core.video.textTracks.length; i++) {
            this.player.core.video.textTracks[i].mode = 'disabled';
        }

        // Enable the selected track
        if (index !== null && index >= 0 && index < this.player.core.video.textTracks.length) {
            this.player.core.video.textTracks[index].mode = 'showing';
            this.currentSubtitle = index;
        } else {
            this.currentSubtitle = null;
        }

        // Emit subtitle change event
        this.emit('subtitleChange', {
            index: this.currentSubtitle,
            subtitle: this.currentSubtitle !== null ? this.getSubtitles().find(sub => sub.index === this.currentSubtitle) : null
        });

        return this;
    }

    /**
     * Get currently active subtitle track index
     * @returns {number|null} Active track index or null
     */
    getCurrentSubtitle() {
        if (!this.player.core.video || !this.player.core.video.textTracks) {
            return null;
        }

        for (let i = 0; i < this.player.core.video.textTracks.length; i++) {
            if (this.player.core.video.textTracks[i].mode === 'showing') {
                return i;
            }
        }
        return null;
    }

    /**
     * Get subtitle track by language
     * @param {string} language - Language code (e.g., 'en', 'ko')
     * @returns {Object|null} Subtitle track object
     */
    getSubtitleByLanguage(language) {
        const subtitles = this.getSubtitles();
        return subtitles.find(sub => sub.language === language) || null;
    }

    /**
     * Set subtitle by language
     * @param {string} language - Language code
     * @returns {boolean} True if subtitle was found and set
     */
    setSubtitleByLanguage(language) {
        const subtitle = this.getSubtitleByLanguage(language);
        if (subtitle) {
            this.setSubtitle(subtitle.index);
            return true;
        }
        return false;
    }

    /**
     * Toggle subtitles on/off
     * @returns {SubtitleManager} this
     */
    toggleSubtitles() {
        const current = this.getCurrentSubtitle();
        if (current !== null) {
            this.setSubtitle(null); // Turn off
        } else {
            // Turn on first available subtitle
            const subtitles = this.getSubtitles();
            if (subtitles.length > 0) {
                this.setSubtitle(subtitles[0].index);
            }
        }
        return this;
    }

    /**
     * Check if subtitles are available
     * @returns {boolean} True if subtitles are available
     */
    hasSubtitles() {
        return this.getSubtitles().length > 0;
    }

    /**
     * Get subtitle status
     * @returns {Object} Status object
     */
    getStatus() {
        const current = this.getCurrentSubtitle();
        const subtitles = this.getSubtitles();

        return {
            available: subtitles,
            current: current,
            enabled: current !== null,
            count: subtitles.length
        };
    }

    /**
     * Destroy subtitle manager
     */
    destroy() {
        this.removeAllListeners();
        this.currentSubtitle = null;
    }
}