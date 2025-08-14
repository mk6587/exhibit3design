# Video Streaming Optimization Guide

This guide explains how to convert your MP4 videos to HLS (HTTP Live Streaming) format for better performance, faster loading, and adaptive bitrate streaming.

## What is HLS Streaming?

HLS (HTTP Live Streaming) breaks videos into small chunks (segments) and creates playlists (.m3u8 files) that allow:

- **Adaptive bitrate streaming** - Automatically adjusts quality based on connection speed
- **Faster startup times** - Only downloads small chunks as needed
- **Better buffering** - Reduces stuttering and loading issues
- **Multiple quality levels** - Automatic switching between qualities
- **Mobile optimization** - Better performance on mobile devices

## Converting MP4 to HLS

### Option 1: Using FFmpeg (Recommended)

1. **Install FFmpeg**: Download from https://ffmpeg.org/

2. **Basic HLS conversion**:
```bash
ffmpeg -i input_video.mp4 \
  -c:v h264 -c:a aac \
  -hls_time 4 \
  -hls_list_size 0 \
  -hls_segment_filename 'segment_%03d.ts' \
  output_video.m3u8
```

3. **Multi-bitrate HLS with different qualities**:
```bash
#!/bin/bash
# Create multiple quality versions
ffmpeg -i input_video.mp4 \
  -filter_complex \
  "[0:v]split=4[v1][v2][v3][v4]; \
   [v1]copy[v1out]; \
   [v2]scale=w=1280:h=720[v2out]; \
   [v3]scale=w=854:h=480[v3out]; \
   [v4]scale=w=640:h=360[v4out]" \
  -map [v1out] -c:v:0 libx264 -b:v:0 5000k -maxrate:v:0 5350k -bufsize:v:0 7500k \
  -map [v2out] -c:v:1 libx264 -b:v:1 2800k -maxrate:v:1 2996k -bufsize:v:1 4200k \
  -map [v3out] -c:v:2 libx264 -b:v:2 1400k -maxrate:v:2 1498k -bufsize:v:2 2100k \
  -map [v4out] -c:v:3 libx264 -b:v:3 800k -maxrate:v:3 856k -bufsize:v:3 1200k \
  -map a:0 -c:a:0 aac -b:a:0 96k \
  -map a:0 -c:a:1 aac -b:a:1 96k \
  -map a:0 -c:a:2 aac -b:a:2 96k \
  -map a:0 -c:a:3 aac -b:a:3 96k \
  -f hls \
  -hls_time 4 \
  -hls_playlist_type vod \
  -hls_flags independent_segments \
  -hls_segment_type mpegts \
  -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3" \
  -master_pl_name master.m3u8 \
  -hls_segment_filename "stream_%v/segment_%03d.ts" \
  "stream_%v/playlist.m3u8"
```

### Option 2: Using Online Services

1. **AWS MediaConvert**: Professional-grade conversion service
2. **Cloudinary**: Easy API-based video processing
3. **Mux**: Developer-friendly video infrastructure
4. **Wowza Streaming Engine**: Enterprise streaming platform

### Option 3: Using Node.js (Programmatic)

```javascript
const ffmpeg = require('fluent-ffmpeg');

function convertToHLS(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v h264',
        '-c:a aac', 
        '-hls_time 4',
        '-hls_list_size 0',
        '-hls_segment_filename segment_%03d.ts'
      ])
      .output(outputPath)
      .on('end', () => {
        console.log('HLS conversion completed');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error:', err);
        reject(err);
      })
      .run();
  });
}

// Usage
convertToHLS('input.mp4', 'output.m3u8');
```

## Uploading to Supabase Storage

1. **Upload your HLS files**:
```javascript
// Upload m3u8 playlist
await supabase.storage
  .from('video')
  .upload('video_name.m3u8', m3u8File, {
    contentType: 'application/vnd.apple.mpegurl'
  });

// Upload segment files  
for (let segment of segments) {
  await supabase.storage
    .from('video')
    .upload(`segments/segment_${i}.ts`, segment, {
      contentType: 'video/mp2t'
    });
}
```

2. **Update your component**:
```jsx
<VideoStream
  src="https://your-project.supabase.co/storage/v1/object/public/video/fallback.mp4"
  hlsUrl="https://your-project.supabase.co/storage/v1/object/public/video/video.m3u8"
  autoPlay
  loop
  muted
/>
```

## Best Practices

### 1. Segment Duration
- **4-6 seconds**: Good balance between quality and performance
- **2-4 seconds**: Better for live streaming
- **6-10 seconds**: Better for VOD content

### 2. Quality Levels
Recommended bitrates for different resolutions:
- **1080p**: 5000 kbps
- **720p**: 2500 kbps  
- **480p**: 1200 kbps
- **360p**: 800 kbps

### 3. File Organization
```
video/
├── master.m3u8           # Master playlist
├── 1080p/
│   ├── playlist.m3u8     # 1080p playlist  
│   ├── segment_001.ts
│   ├── segment_002.ts
│   └── ...
├── 720p/
│   ├── playlist.m3u8
│   └── segments...
└── 480p/
    ├── playlist.m3u8
    └── segments...
```

## Performance Benefits

### Before (MP4):
- **Large file size**: 50MB+ downloaded at once
- **Slow startup**: Wait for entire file to buffer
- **Fixed quality**: No adaptation to network speed
- **Mobile issues**: Poor performance on slow connections

### After (HLS):
- **Small chunks**: 200KB-500KB segments
- **Fast startup**: Play after first segment loads
- **Adaptive quality**: Automatically adjusts to connection
- **Better mobile**: Optimized for mobile networks

## Monitoring & Analytics

Track streaming performance:
```javascript
hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
  console.log('Quality switched to:', data.level);
  // Track quality changes for analytics
});

hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
  console.log('Segment loaded:', data.frag.duration);
  // Track loading performance  
});
```

## Troubleshooting

### Common Issues:
1. **CORS errors**: Ensure proper CORS headers on storage bucket
2. **Codec issues**: Use H.264 video and AAC audio
3. **Segment not found**: Check file paths and permissions
4. **Playback stuttering**: Reduce segment size or check network

### Debug Tools:
- Browser DevTools Network tab
- HLS.js debug logs
- FFprobe for media analysis

## Current Implementation

The VideoStream component is already configured to:
- ✅ Detect HLS support automatically
- ✅ Fallback to MP4 if HLS unavailable  
- ✅ Show loading states and error handling
- ✅ Lazy load videos when in viewport
- ✅ Adaptive bitrate streaming (when HLS available)

To enable HLS for your current video, simply:
1. Convert your MP4 to HLS format using the methods above
2. Upload the HLS files to Supabase storage
3. Update the `hlsUrl` prop in your VideoStream component