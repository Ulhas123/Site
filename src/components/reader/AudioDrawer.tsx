import React, { useState } from 'react'
import { FastForward, Pause, Play, Rewind, Volume2 } from 'lucide-react'
import { useUI } from '../../store/useUI'
import { Drawer } from '../ui/Drawer'

export interface AudioDrawerProps {
  chapterTitle?: string
  novelTitle?: string
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0]
const VOICES = ['Aura (Warm & Narrative)', 'Echo (Deep & Cinematic)', 'Nova (Clear & Energetic)']

export const AudioDrawer: React.FC<AudioDrawerProps> = ({
  chapterTitle = 'Chapter 1',
  novelTitle = 'The Shattered Reach',
}) => {
  const activePanel = useUI((s) => s.activePanel)
  const closePanel = useUI((s) => s.closePanel)

  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1.0)
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0])
  const [progressPercent, setProgressPercent] = useState(18)

  const isOpen = activePanel === 'audio'

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closePanel}
      title="Audio Narration"
      description="Text-to-speech audio reader"
      widthClass="sm:max-w-md sm:w-full"
    >
      <div className="space-y-6 pb-6 text-sm">
        {/* Track Info Card */}
        <div className="p-4 rounded-2xl bg-raised border border-line text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-accent/15 text-accent flex items-center justify-center">
            <Volume2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-bold text-ink text-sm sm:text-base">{chapterTitle}</h3>
            <p className="text-xs text-muted">{novelTitle}</p>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="pt-2 space-y-1">
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent}
              onChange={(e) => setProgressPercent(Number(e.target.value))}
              aria-label="Audio progress"
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-muted">
              <span>02:14</span>
              <span>12:45</span>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setProgressPercent(Math.max(0, progressPercent - 5))}
            aria-label="Rewind 15 seconds"
            className="w-11 h-11 rounded-full bg-raised hover:bg-page border border-line flex items-center justify-center text-ink cursor-pointer focus-visible:ring-2 focus-visible:ring-system"
          >
            <Rewind className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
            className="w-14 h-14 rounded-full bg-accent hover:opacity-90 text-accent-ink flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer focus-visible:ring-2 focus-visible:ring-system"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" aria-hidden="true" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-0.5" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setProgressPercent(Math.min(100, progressPercent + 5))}
            aria-label="Forward 15 seconds"
            className="w-11 h-11 rounded-full bg-raised hover:bg-page border border-line flex items-center justify-center text-ink cursor-pointer focus-visible:ring-2 focus-visible:ring-system"
          >
            <FastForward className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">
            Playback Speed
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                aria-pressed={speed === s}
                className={`py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer text-center focus-visible:ring-2 focus-visible:ring-system ${
                  speed === s
                    ? 'bg-page border-system text-ink shadow-xs'
                    : 'bg-raised/40 hover:bg-raised border-line text-muted hover:text-ink'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">
            Narrator Voice
          </label>
          <div className="space-y-1.5">
            {VOICES.map((voice) => (
              <button
                key={voice}
                type="button"
                onClick={() => setSelectedVoice(voice)}
                aria-pressed={selectedVoice === voice}
                className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-system ${
                  selectedVoice === voice
                    ? 'bg-page border-system text-ink font-bold shadow-xs'
                    : 'bg-raised/30 hover:bg-raised border-line text-muted hover:text-ink'
                }`}
              >
                {voice}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  )
}
