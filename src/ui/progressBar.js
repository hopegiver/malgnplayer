import { createElement } from '../utils/dom.js';

export class ProgressBar {
    constructor(ui) {
        this.ui = ui;
        this.player = ui.player;
        this.container = ui.container;
        this.isDragging = false;

        this.init();
    }

    init() {
        this.createProgressBar();
        this.bindEvents();
    }

    createProgressBar() {
        // Progress bar
        this.progressContainer = createElement('div', { className: 'malgnplayer-progress-container' });
        this.progressBar = createElement('div', { className: 'malgnplayer-progress-bar' });
        this.progressBuffer = createElement('div', { className: 'malgnplayer-progress-buffer' });
        this.progressPlayed = createElement('div', { className: 'malgnplayer-progress-played' });
        this.progressThumb = createElement('div', { className: 'malgnplayer-progress-thumb' });
        this.progressTooltip = createElement('div', {
            className: 'malgnplayer-progress-tooltip',
            innerHTML: '0:00'
        });

        this.progressBar.appendChild(this.progressBuffer);
        this.progressBar.appendChild(this.progressPlayed);
        this.progressBar.appendChild(this.progressThumb);
        this.progressBar.appendChild(this.progressTooltip);
        this.progressContainer.appendChild(this.progressBar);
    }

    bindEvents() {
        // Progress bar interaction
        this.progressBar.addEventListener('click', (e) => {
            if (!this.isDragging) {
                const rect = this.progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                const duration = this.player.getDuration();
                if (duration) {
                    this.player.seek(duration * percent);
                }
            }
        });

        // Progress bar drag functionality
        this.progressBar.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.updateProgressFromMouse(e);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.updateProgressFromMouse(e);
            } else if (this.progressBar.contains(e.target) || this.progressBar === e.target) {
                this.updateProgressTooltip(e);
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                this.isDragging = false;
                // Hide tooltip if mouse is not over progress bar
                if (!this.progressBar.contains(e.target) && this.progressBar !== e.target) {
                    this.progressTooltip.style.opacity = '0';
                }
            }
        });

        // Progress bar tooltip
        this.progressBar.addEventListener('mouseenter', () => {
            this.progressTooltip.style.opacity = '1';
        });

        this.progressBar.addEventListener('mouseleave', () => {
            if (!this.isDragging) {
                this.progressTooltip.style.opacity = '0';
            }
        });

        // Touch events for mobile
        this.progressBar.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDragging = true;
            const touch = e.touches[0];
            this.updateProgressFromTouch(touch);
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                this.updateProgressFromTouch(touch);
            }
        });

        document.addEventListener('touchend', (e) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.progressTooltip.style.opacity = '0';
            }
        });

        // Player events
        this.player.on('timeupdate', (data) => {
            this.updateProgress(data.currentTime, data.duration);
        });
    }

    updateProgress(currentTime, duration) {
        if (!duration) return;

        const percent = (currentTime / duration) * 100;
        this.progressPlayed.style.width = `${percent}%`;
        this.progressThumb.style.left = `${percent}%`;
    }

    updateProgressTooltip(event) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const duration = this.player.getDuration();

        if (duration) {
            const time = duration * percent;
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            this.progressTooltip.textContent = timeString;
            this.progressTooltip.style.left = `${percent * 100}%`;
        }
    }

    updateProgressFromMouse(event) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const duration = this.player.getDuration();

        if (duration) {
            const time = duration * percent;

            // Update visual progress immediately
            this.progressPlayed.style.width = `${percent * 100}%`;
            this.progressThumb.style.left = `${percent * 100}%`;

            // Update tooltip
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            this.progressTooltip.textContent = timeString;
            this.progressTooltip.style.left = `${percent * 100}%`;
            this.progressTooltip.style.opacity = '1';

            // Seek video to new position
            this.player.seek(time);
        }
    }

    updateProgressFromTouch(touch) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        const duration = this.player.getDuration();

        if (duration) {
            const time = duration * percent;

            // Update visual progress immediately
            this.progressPlayed.style.width = `${percent * 100}%`;
            this.progressThumb.style.left = `${percent * 100}%`;

            // Seek video to new position
            this.player.seek(time);
        }
    }

    getElement() {
        return this.progressContainer;
    }

    destroy() {
        if (this.progressContainer && this.progressContainer.parentNode) {
            this.progressContainer.parentNode.removeChild(this.progressContainer);
        }
    }
}