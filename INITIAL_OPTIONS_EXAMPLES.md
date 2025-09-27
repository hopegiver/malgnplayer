# Initial Options Examples

MalgnPlayer supports loading media content directly via constructor options for immediate playback setup.

## Single File Options

### Basic File Loading
```javascript
const player = new MalgnPlayer('player', {
    width: '800px',
    height: '450px',
    file: 'video.mp4',
    controls: true
});
```

### Complete File Configuration
```javascript
const player = new MalgnPlayer('player', {
    width: '800px',
    height: '450px',
    file: 'https://example.com/video.mp4',
    type: 'mp4',
    title: 'My Video',
    poster: 'https://example.com/poster.jpg',
    controls: true,
    autoplay: false,
    muted: false
});
```

### HLS Stream with Options
```javascript
const player = new MalgnPlayer('player', {
    width: '100%',
    height: '400px',
    file: 'https://example.com/stream.m3u8',
    type: 'hls',
    title: 'Live Stream',
    poster: 'stream-poster.jpg',
    controls: true
});
```

## Playlist/Sources Options

### Multiple Sources
```javascript
const player = new MalgnPlayer('player', {
    width: '800px',
    height: '450px',
    sources: [
        {
            file: 'video1.mp4',
            title: 'Video 1',
            poster: 'poster1.jpg'
        },
        {
            file: 'video2.mp4',
            title: 'Video 2',
            poster: 'poster2.jpg'
        }
    ],
    controls: true
});
```

### Mixed Content Types
```javascript
const player = new MalgnPlayer('player', {
    width: '800px',
    height: '450px',
    sources: [
        {
            file: 'https://example.com/video.mp4',
            type: 'mp4',
            title: 'MP4 Video',
            poster: 'mp4-poster.jpg'
        },
        {
            file: 'https://example.com/stream.m3u8',
            type: 'hls',
            title: 'HLS Stream',
            poster: 'hls-poster.jpg'
        }
    ],
    controls: true
});
```

## Available Player Functions

### Basic Controls
```javascript
player.play();           // Start playback
player.pause();          // Pause playback
player.stop();           // Stop and reset to beginning
player.togglePlay();     // Toggle between play/pause
player.restart();        // Reset to beginning
```

### Seeking Controls
```javascript
player.seek(30);              // Seek to 30 seconds
player.setCurrentTime(45);    // Same as seek
player.rewind(10);            // Go back 10 seconds
player.fastForward(15);       // Go forward 15 seconds
```

### State Queries
```javascript
player.isPlaying();      // Returns true if playing
player.isPaused();       // Returns true if paused
player.isEnded();        // Returns true if ended
player.isIdle();         // Returns true if idle
player.getState();       // Returns current state string
```

### Time and Position
```javascript
player.getCurrentTime(); // Get current playback position
player.getPosition();    // Alias for getCurrentTime()
player.getDuration();    // Get total duration
player.getBuffer();      // Get buffer percentage (0-100)
```

### Volume Controls
```javascript
player.setVolume(0.8);        // Set volume (0-1)
player.getVolume();           // Get current volume
player.setMute(true);         // Mute/unmute
player.getMute();             // Get mute status
```

### Playlist Controls
```javascript
player.playlistNext();        // Play next item
player.playlistPrev();        // Play previous item
player.playlistItem(2);       // Play specific item by index
player.getPlaylist();         // Get playlist items
player.getPlaylistIndex();    // Get current item index
```

### Poster/Thumbnail
```javascript
player.setPoster('new-poster.jpg'); // Set poster image
player.getPoster();                  // Get current poster URL
```

### Quality Controls (HLS)
```javascript
player.getQualityLevels();    // Get available quality levels
player.getCurrentQuality();   // Get current quality level
player.setCurrentQuality(2);  // Set quality level
```

### Subtitles
```javascript
player.getSubtitles();        // Get available subtitle tracks
player.setSubtitle(1);        // Set active subtitle track
player.getCurrentSubtitle();  // Get current subtitle track
```

### Utility Functions
```javascript
player.getVideoElement();     // Get underlying video element
player.getContainer();        // Get player container element
player.getConfig();          // Get player configuration
player.resize('600px', '400px'); // Resize player
```

## Configuration Priority

1. **sources**: Takes precedence over single file options
2. **playlist**: Legacy option, equivalent to sources
3. **file + type/title/poster**: Single file with metadata
4. **file**: Simple file URL only

## Example Use Cases

### Media Gallery Player
```javascript
const galleryPlayer = new MalgnPlayer('gallery-player', {
    width: '100%',
    height: '400px',
    sources: galleryVideos, // Array from your data source
    controls: true,
    autoplay: false
});
```

### Live Stream Player
```javascript
const livePlayer = new MalgnPlayer('live-player', {
    width: '800px',
    height: '450px',
    file: 'https://stream.example.com/live.m3u8',
    type: 'hls',
    title: 'Live Stream',
    poster: 'live-poster.jpg',
    autoplay: true,
    muted: true  // Required for autoplay in most browsers
});
```