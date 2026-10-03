import { execFile } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import ffmpegPath from 'ffmpeg-static'
import type { Bucket } from '@google-cloud/storage'

const run = promisify(execFile)

// Longest side at most 1280 px (720p), even dimensions for H.264, never upscaled
const SCALE = `scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))'`

/** Where the playable MP4 and its poster frame live, next to the original upload */
export function videoOutputPaths(originalPath: string) {
  return { mp4: `${originalPath}.mp4`, poster: `${originalPath}.jpg` }
}

/**
 * Turns an uploaded phone video (often HEVC .mov) into an H.264 MP4 every browser can play,
 * plus a JPEG poster frame. Metadata such as the GPS location is stripped.
 */
export async function transcodeVideo(bucket: Bucket, originalPath: string) {
  if (!ffmpegPath) throw new Error('ffmpeg binary not available')
  const dir = await mkdtemp(join(tmpdir(), 'video-'))
  const input = join(dir, 'input')
  const mp4 = join(dir, 'output.mp4')
  const poster = join(dir, 'poster.jpg')
  const out = videoOutputPaths(originalPath)

  try {
    await bucket.file(originalPath).download({ destination: input })

    await run(ffmpegPath, [
      '-y', '-i', input,
      '-vf', SCALE,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '26', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '128k',
      '-map_metadata', '-1',
      '-movflags', '+faststart', // playback can start before the whole file is in
      mp4,
    ])

    // half a second in skips the black first frame many phone videos start with
    try {
      await run(ffmpegPath, ['-y', '-ss', '0.5', '-i', mp4, '-frames:v', '1', '-q:v', '3', poster])
    } catch {
      await run(ffmpegPath, ['-y', '-i', mp4, '-frames:v', '1', '-q:v', '3', poster])
    }

    // no mediaId in the metadata, so the upload trigger leaves these outputs alone
    const metadata = { cacheControl: 'public, max-age=31536000', metadata: { derivedFrom: originalPath } }
    await bucket.upload(mp4, { destination: out.mp4, contentType: 'video/mp4', metadata })
    await bucket.upload(poster, { destination: out.poster, contentType: 'image/jpeg', metadata })
    return out
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
