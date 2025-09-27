# Type Configuration Examples

MalgnPlayer supports explicit type specification for files without extensions or when automatic detection fails. It also supports poster images for better user experience.

## Basic Usage

### Auto-detection (based on file extension)
```javascript
player.load({
    file: 'video.mp4',
    title: 'Auto-detected MP4',
    poster: 'preview.jpg'
});

player.load({
    file: 'stream.m3u8',
    title: 'Auto-detected HLS',
    poster: 'stream-preview.jpg'
});
```

### Explicit Type Specification

#### Regular Video Files
```javascript
// MP4 without extension
player.load({
    file: 'https://example.com/video',
    type: 'mp4',
    title: 'Explicit MP4 type'
});

// WebM with explicit type
player.load({
    file: 'https://example.com/video',
    type: 'webm',
    title: 'Explicit WebM type'
});

// Using MIME type
player.load({
    file: 'https://example.com/video',
    type: 'video/mp4',
    title: 'Explicit MIME type'
});
```

#### HLS Streams
```javascript
// HLS without .m3u8 extension
player.load({
    file: 'https://example.com/stream',
    type: 'hls',
    title: 'Explicit HLS type'
});

// Alternative HLS type specifications
player.load({
    file: 'https://example.com/stream',
    type: 'm3u8',
    title: 'M3U8 type'
});

player.load({
    file: 'https://example.com/stream',
    type: 'application/x-mpegurl',
    title: 'MIME type for HLS'
});
```

## Supported Types

### Video Types
- `mp4` or `video/mp4`
- `webm` or `video/webm`
- `ogg` or `video/ogg`
- `avi` or `video/x-msvideo`
- `mov` or `video/quicktime`
- `mkv` or `video/x-matroska`

### HLS Types
- `hls`
- `m3u8`
- `application/x-mpegurl`
- `application/vnd.apple.mpegurl`

## Playlist with Types
```javascript
player.load({
    sources: [
        {
            file: 'https://example.com/video1',
            type: 'mp4',
            title: 'Video 1'
        },
        {
            file: 'https://example.com/stream1',
            type: 'hls',
            title: 'Stream 1'
        }
    ]
});
```

## Poster Image API

### Setting Poster Programmatically
```javascript
// Set poster image
player.setPoster('path/to/poster.jpg');

// Remove poster image
player.setPoster(null);

// Get current poster
const currentPoster = player.getPoster();
```

### Poster with Load
```javascript
// Load video with poster
player.load({
    file: 'video.mp4',
    title: 'My Video',
    poster: 'poster.jpg',
    type: 'mp4'
});
```

## Fallback Behavior

1. **Type specified**: Uses the specified type for plugin selection
2. **No type specified**: Falls back to file extension detection
3. **Plugin fails**: Falls back to native video element loading
4. **Poster specified**: Shows poster image before video starts playing