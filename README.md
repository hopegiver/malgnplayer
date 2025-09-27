# 🎬 MalgnPlayer

Modern HTML5 video player with JWPlayer-compatible API, comprehensive streaming support, and advanced DRM protection.

[![NPM Version](https://img.shields.io/npm/v/malgnplayer.svg)](https://www.npmjs.com/package/malgnplayer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Issues](https://img.shields.io/github/issues/hopegiver/malgnplayer.svg)](https://github.com/hopegiver/malgnplayer/issues)

## ✨ Features

### 🎥 Core Features
- **JWPlayer-compatible API** - Easy migration from JWPlayer
- **Multiple formats** - MP4, WebM, HLS streaming support
- **Plugin architecture** - Extensible and modular design
- **Responsive design** - Mobile-optimized with touch events
- **Custom UI** - YouTube-style interactions and controls

### 🔒 DRM Protection
- **Widevine DRM** - Google's DRM system support
- **PlayReady DRM** - Microsoft's DRM system support
- **EME Integration** - Native browser DRM via Encrypted Media Extensions
- **License management** - Automatic acquisition and renewal

### 🎮 Advanced Controls
- **Speed control** - 0.25x to 2x playback speeds
- **Subtitle support** - Multiple languages with auto-detection
- **Progress bar** - Drag, click, and touch support with tooltips
- **Volume control** - Visual slider with mute functionality
- **Fullscreen** - Native fullscreen API support

### 🔄 Special Modes
- **Autoloop mode** - Seamless looping for GIF-like behavior
- **Custom segments** - Loop specific time ranges
- **Mobile optimization** - Touch-friendly controls and gestures

## 📦 Installation

### NPM
```bash
npm install malgnplayer
```

### CDN
```html
<!-- IIFE (Global variable) -->
<script src="https://unpkg.com/malgnplayer/dist/malgnplayer.min.js"></script>

<!-- ES Module -->
<script type="module">
  import MalgnPlayer from 'https://unpkg.com/malgnplayer/dist/malgnplayer.esm.js';
</script>
```

### Download
Download the latest release from [GitHub Releases](https://github.com/hopegiver/malgnplayer/releases)

## 🚀 Quick Start

### Basic Usage

```html
<div id="player"></div>

<script>
// IIFE version
const player = new MalgnPlayer('player', {
    file: 'https://example.com/video.mp4',
    width: '100%',
    height: '400px'
});
</script>
```

### ES Modules

```javascript
import MalgnPlayer from 'malgnplayer';

const player = new MalgnPlayer('player', {
    file: 'https://example.com/video.mp4',
    poster: 'https://example.com/poster.jpg',
    autoplay: false,
    controls: true
});
```

### HLS Streaming

```javascript
const player = new MalgnPlayer('player', {
    file: 'https://example.com/stream.m3u8',
    type: 'hls'
});
```

### DRM Protected Content

```javascript
const player = new MalgnPlayer('player', {
    file: 'https://example.com/protected-content.m3u8',
    drm: {
        'com.widevine.alpha': {
            licenseServerUrl: 'https://license-server.com/widevine',
            videoRobustness: 'SW_SECURE_DECODE',
            audioRobustness: 'SW_SECURE_CRYPTO'
        }
    }
});
```

### Autoloop Mode

```javascript
const player = new MalgnPlayer('player', {
    file: 'https://example.com/video.mp4',
    autoloop: true,
    loopStartTime: 10,
    loopEndTime: 30,
    muted: true
});
```

## 📚 API Reference

### Constructor

```javascript
new MalgnPlayer(container, config)
```

**Parameters:**
- `container` (string|Element) - Container element ID or DOM element
- `config` (object) - Configuration options

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `file` | string | - | Video file URL |
| `sources` | array | - | Multiple video sources |
| `type` | string | 'auto' | Video type (mp4, hls, etc.) |
| `poster` | string | - | Poster image URL |
| `width` | string | '100%' | Player width |
| `height` | string | '100%' | Player height |
| `autoplay` | boolean | false | Auto-start playback |
| `muted` | boolean | false | Start muted |
| `controls` | boolean | true | Show player controls |
| `autoloop` | boolean | false | Enable autoloop mode |
| `loopStartTime` | number | 0 | Loop start time (seconds) |
| `loopEndTime` | number | null | Loop end time (seconds) |
| `drm` | object | - | DRM configuration |

### Methods

#### Playback Control
```javascript
player.play()           // Start playback
player.pause()          // Pause playback
player.stop()           // Stop and reset to beginning
player.seek(time)       // Seek to time (seconds)
player.setVolume(level) // Set volume (0-100)
player.setMuted(muted)  // Mute/unmute
```

#### Player Control
```javascript
player.load(source)        // Load new media
player.resize(width, height) // Resize player
player.setFullscreen(true)   // Toggle fullscreen
player.destroy()             // Destroy player instance
```

#### Information
```javascript
player.getState()         // Get current state
player.getPosition()      // Get current time
player.getDuration()      // Get total duration
player.getVolume()        // Get volume level
player.getPlaybackRate()  // Get playback speed
```

#### Quality Control
```javascript
player.getQualityLevels()     // Get available quality levels
player.getCurrentQuality()    // Get current quality
player.setCurrentQuality(level) // Set quality level
```

#### Subtitles
```javascript
player.getSubtitles()     // Get available subtitles
player.setSubtitle(index) // Set active subtitle track
```

#### DRM
```javascript
player.getDrmInfo()        // Get DRM information
player.renewDrmLicense()   // Renew DRM license
player.isDrmProtected()    // Check if content is DRM protected
```

#### Autoloop
```javascript
player.enableAutoloop()    // Enable autoloop mode
player.disableAutoloop()   // Disable autoloop mode
player.setLoopSegment(start, end) // Set custom loop segment
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