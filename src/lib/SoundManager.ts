class SoundManager {
  private audioContext: AudioContext | null = null;
  private soundBuffers: { [key: string]: AudioBuffer } = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as Window).webkitAudioContext)();
    }
  }

  async loadSound(name: string, url: string) {
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.soundBuffers[name] = audioBuffer;
    } catch (error) {
      console.error(`Failed to load sound: ${name}`, error);
    }
  }

  playSound(name: string) {
    if (!this.audioContext || !this.soundBuffers[name]) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.soundBuffers[name];
    source.connect(this.audioContext.destination);
    source.start(0);
  }
}

export const soundManager = new SoundManager();
