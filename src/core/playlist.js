import { EventEmitter } from '../utils/events.js';

export class Playlist extends EventEmitter {
    constructor(items = []) {
        super();
        this.items = [];
        this.currentIndex = 0;

        if (Array.isArray(items)) {
            this.items = items;
        } else if (items.sources) {
            this.items = items.sources;
        }
    }

    load(items) {
        if (Array.isArray(items)) {
            this.items = items;
        } else if (items.sources) {
            this.items = items.sources;
        } else {
            this.items = [items];
        }

        this.currentIndex = 0;
        this.emit('playlistLoaded', {
            playlist: this.items,
            currentIndex: this.currentIndex
        });
    }

    getItem(index) {
        return this.items[index] || null;
    }

    getCurrentItem() {
        return this.getItem(this.currentIndex);
    }

    next() {
        if (this.currentIndex < this.items.length - 1) {
            this.currentIndex++;
            this.emit('playlistItem', {
                index: this.currentIndex,
                item: this.getCurrentItem()
            });
            return this.getCurrentItem();
        }
        return null;
    }

    previous() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.emit('playlistItem', {
                index: this.currentIndex,
                item: this.getCurrentItem()
            });
            return this.getCurrentItem();
        }
        return null;
    }

    playItem(index) {
        if (index >= 0 && index < this.items.length) {
            this.currentIndex = index;
            this.emit('playlistItem', {
                index: this.currentIndex,
                item: this.getCurrentItem()
            });
            return this.getCurrentItem();
        }
        return null;
    }

    getPlaylist() {
        return this.items;
    }

    getPlaylistIndex() {
        return this.currentIndex;
    }

    addItem(item) {
        this.items.push(item);
        this.emit('playlistUpdated', {
            playlist: this.items
        });
    }

    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 1);
            if (this.currentIndex >= index && this.currentIndex > 0) {
                this.currentIndex--;
            }
            this.emit('playlistUpdated', {
                playlist: this.items,
                currentIndex: this.currentIndex
            });
        }
    }

    clear() {
        this.items = [];
        this.currentIndex = 0;
        this.emit('playlistUpdated', {
            playlist: this.items,
            currentIndex: this.currentIndex
        });
    }

    size() {
        return this.items.length;
    }
}