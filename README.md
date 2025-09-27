# MalgnPlayer

A modern HTML5 video player with JWPlayer-compatible API for easy migration. Built with ES6 modules and optimized for both desktop and mobile devices.

## Features

- **JWPlayer-compatible API** - Easy migration from JWPlayer
- **Multiple format support** - MP4, HLS streams with automatic fallback
- **Mobile optimized** - Touch-friendly controls and responsive design
- **Speed control** - 0.25x to 2x playback speed
- **Subtitle support** - Automatic subtitle loading and selection
- **YouTube-style interactions** - Click to pause, double-click to seek
- **Autoloop mode** - Perfect for homepage banners and product showcases
- **Modern architecture** - ES6 modules with plugin system

## Installation

### CDN (Recommended)
```html
<script src="https://cdn.jsdelivr.net/gh/hopegiver/malgnplayer@latest/dist/malgnplayer.min.js"></script>
```

### Download
Download the latest release and include the script:
```html
<script src="path/to/malgnplayer.min.js"></script>
```

### ES Module
```javascript
import MalgnPlayer from './malgnplayer.esm.js';
```

## Basic Usage

### HTML Setup
```html
<div id="player"></div>
```

### JavaScript
```javascript
// Basic setup
const player = new MalgnPlayer('player');

// Load a video
player.load({
    file: 'https://example.com/video.mp4',
    title: 'My Video',
    poster: 'https://example.com/poster.jpg'
});

// Start playback
player.play();
```

## Configuration Options

```javascript
const player = new MalgnPlayer('player', {
    file: 'https://example.com/video.mp4',
    type: 'mp4',
    title: 'Video Title',
    poster: 'https://example.com/poster.jpg',
    sources: [
        {
            file: 'https://example.com/video.mp4',
            type: 'mp4',
            label: '720p'
        },
        {
            file: 'https://example.com/stream.m3u8',
            type: 'hls',
            label: '1080p'
        }
    ]
});
```

## API Methods

### Playback Control
```javascript
player.play();           // Start playback
player.pause();          // Pause playback
player.stop();           // Stop and reset
player.seek(30);         // Seek to 30 seconds
```

### Load Content
```javascript
// Load single video
player.load({
    file: 'video.mp4',
    title: 'My Video'
});

// Load playlist
player.load([
    { file: 'video1.mp4', title: 'Video 1' },
    { file: 'video2.mp4', title: 'Video 2' }
]);
```

### Get Player State
```javascript
player.getState();       // 'idle', 'loading', 'playing', 'paused'
player.getPosition();    // Current time in seconds
player.getDuration();    // Total duration in seconds
player.getVolume();      // Volume level (0-100)
```

### Volume Control
```javascript
player.setVolume(50);    // Set volume to 50%
player.setMute(true);    // Mute audio
```

## Event Handling

```javascript
// Listen to events
player.on('ready', () => {
    console.log('Player is ready');
});

player.on('play', () => {
    console.log('Playback started');
});

player.on('pause', () => {
    console.log('Playback paused');
});

player.on('complete', () => {
    console.log('Video completed');
});

player.on('error', (error) => {
    console.error('Player error:', error);
});
```

## HLS Streaming

For HLS streams, the player automatically loads the hls.js library:

```javascript
player.load({
    file: 'https://example.com/stream.m3u8',
    type: 'hls',
    title: 'Live Stream'
});
```

## Autoloop Mode

Perfect for homepage banners, product showcases, and promotional content. Works like an animated GIF with better quality and smaller file sizes.

### Basic Autoloop Setup

```javascript
// Create autoloop player (no controls, muted, loops every 30 seconds)
const player = new MalgnPlayer('banner-video', {
    file: 'https://example.com/promo.mp4',
    autoloop: true,
    loopDuration: 30,  // Loop every 30 seconds
    controls: false,   // Hide controls (automatically set in autoloop mode)
    muted: true       // Required for autoplay in most browsers
});

// Seamless autoloop (always seamless, no restart feeling)
const seamlessPlayer = new MalgnPlayer('seamless-banner', {
    file: 'https://example.com/promo.mp4',
    autoloop: true,     // Always seamless
    muted: true
});
```

### Autoloop Configuration Options

```javascript
const player = new MalgnPlayer('player', {
    autoloop: true,           // Enable autoloop mode (always seamless)
    loopStartTime: 5,         // Start loop from 5 seconds
    loopEndTime: 20,          // End loop at 20 seconds
    controls: false,          // Controls automatically hidden in autoloop mode
    muted: true,             // Required for autoplay
    poster: 'poster.jpg'     // Show poster until video loads
});

// More examples
const productShowcase = new MalgnPlayer('product-video', {
    file: 'product-demo.mp4',
    autoloop: true,
    loopStartTime: 10.5,      // Start from 10.5 seconds
    loopEndTime: 25.3,        // End at 25.3 seconds (core feature demo)
    muted: true
});

const heroBanner = new MalgnPlayer('hero-banner', {
    file: 'hero-video.mp4',
    autoloop: true,
    loopStartTime: 0,         // From beginning
    loopEndTime: 8,           // First 8 seconds only
    muted: true
});
```

### Dynamic Autoloop Control

```javascript
// Enable autoloop (always seamless)
await player.setAutoloop(true);

// Set specific segment loop (5-15 seconds)
player.setLoopSegment(5, 15);
await player.setAutoloop(true);

// Disable autoloop and restore normal playback
await player.setAutoloop(false);

// Check current autoloop settings
const autoloop = player.getAutoloop();
console.log(autoloop.enabled);   // true/false
console.log(autoloop.startTime); // loop start time
console.log(autoloop.endTime);   // loop end time
```

### Use Cases

- **Homepage Hero Sections**: Eye-catching video backgrounds
- **Product Showcases**: Seamless product demonstration loops
- **Promotional Banners**: Marketing content that doesn't require user interaction
- **Background Videos**: Atmospheric content for landing pages

### CSS Styling for Autoloop

```css
.banner-video {
    width: 100%;
    height: 400px;
    object-fit: cover;
    border-radius: 8px;
}

/* Full-width banner */
.hero-video {
    width: 100vw;
    height: 60vh;
    object-fit: cover;
}
```

## Mobile Support

The player is optimized for mobile devices with:
- Touch-friendly controls
- Responsive design
- Touch gestures (tap to pause, double-tap to seek)
- Proper viewport handling

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Build from Source
```bash
git clone https://github.com/hopegiver/malgnplayer.git
cd malgnplayer
npm install
node build.js
```

### Project Structure
```
src/
├── malgnplayer.js      # Main player class
├── core/               # Core video engine
├── ui/                 # UI components
├── utils/              # Utilities
└── plugins/            # Plugin system
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.