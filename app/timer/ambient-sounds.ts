import * as Tone from 'tone';

export type SoundMode = 
  | 'none' 
  | 'rain' 
  | 'forest' 
  | 'cafe' 
  | 'brown' 
  | 'pink' 
  | 'ocean' 
  | 'airplane';

interface SoundChain {
  nodes: Tone.ToneAudioNode[];
  starters: Array<() => void>;
}

class AmbientSoundService {
  private masterGain: Tone.Gain | null = null;
  private limiter: Tone.Limiter | null = null;
  private currentChain: SoundChain | null = null;
  private currentMode: SoundMode = 'none';
  private isInitialized = false;
  private fadeOutTimeout: NodeJS.Timeout | null = null;

  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    await Tone.start();
    
    // Master chain: limiter → gain → destination
    this.limiter = new Tone.Limiter(-1);
    this.masterGain = new Tone.Gain(0); // Start at 0 for fade in
    
    this.masterGain.connect(this.limiter);
    this.limiter.toDestination();
    
    this.isInitialized = true;
  }

  private createRainChain(): SoundChain {
    // Rain Focus: steady hiss, no droplets
    const noise = new Tone.Noise('pink');
    const highpass = new Tone.Filter({
      type: 'highpass',
      frequency: 1000,
      rolloff: -12,
    });
    const lowpass = new Tone.Filter({
      type: 'lowpass',
      frequency: 4500,
      rolloff: -12,
    });
    
    // Subtle amplitude flutter
    const lfo = new Tone.LFO({
      frequency: 0.8,
      min: 0.85,
      max: 0.95,
    });
    const gainNode = new Tone.Gain(0.9);
    
    // Connect chain
    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(this.masterGain!);
    lfo.connect(gainNode.gain);
    
    return {
      nodes: [noise, highpass, lowpass, lfo, gainNode],
      starters: [() => noise.start(), () => lfo.start()],
    };
  }

  private createForestChain(): SoundChain {
    // Forest Focus: wind/leaves without birds
    const noise = new Tone.Noise('brown');
    const highpass = new Tone.Filter({
      type: 'highpass',
      frequency: 200,
      rolloff: -12,
    });
    const lowpass = new Tone.Filter({
      type: 'lowpass',
      frequency: 4500,
      rolloff: -12,
    });
    
    // Slow cutoff modulation for wind movement
    const lfo = new Tone.LFO({
      frequency: 0.06,
      min: 3000,
      max: 5000,
    });
    
    // Connect chain
    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(this.masterGain!);
    lfo.connect(lowpass.frequency);
    
    return {
      nodes: [noise, highpass, lowpass, lfo],
      starters: [() => noise.start(), () => lfo.start()],
    };
  }

  private createCafeChain(): SoundChain {
    // Cafe Focus: room tone, no voices/dishes
    const noise = new Tone.Noise('pink');
    const highpass = new Tone.Filter({
      type: 'highpass',
      frequency: 500,
      rolloff: -12,
    });
    const lowpass = new Tone.Filter({
      type: 'lowpass',
      frequency: 3500,
      rolloff: -12,
    });
    
    // Subtle room ambience flutter
    const lfo = new Tone.LFO({
      frequency: 0.4,
      min: 0.88,
      max: 0.96,
    });
    const gainNode = new Tone.Gain(0.92);
    
    // Connect chain
    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(this.masterGain!);
    lfo.connect(gainNode.gain);
    
    return {
      nodes: [noise, highpass, lowpass, lfo, gainNode],
      starters: [() => noise.start(), () => lfo.start()],
    };
  }

  private createBrownNoiseChain(): SoundChain {
    // Pure brown noise: extreme non-distracting focus masker
    const noise = new Tone.Noise('brown');
    const lowpass = new Tone.Filter({
      type: 'lowpass',
      frequency: 3000,
      rolloff: -12,
    });
    
    // Tiny flutter for naturalness
    const lfo = new Tone.LFO({
      frequency: 0.1,
      min: 0.92,
      max: 0.98,
    });
    const gainNode = new Tone.Gain(0.95);
    
    noise.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(this.masterGain!);
    lfo.connect(gainNode.gain);
    
    return {
      nodes: [noise, lowpass, lfo, gainNode],
      starters: [() => noise.start(), () => lfo.start()],
    };
  }

  private createPinkNoiseChain(): SoundChain {
    // Neutral pink noise focus
    const noise = new Tone.Noise('pink');
    const highpass = new Tone.Filter({
      type: 'highpass',
      frequency: 100,
      rolloff: -12,
    });
    const lowpass = new Tone.Filter({
      type: 'lowpass',
      frequency: 5000,
      rolloff: -12,
    });
    
    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(this.masterGain!);
    
    return {
      nodes: [noise, highpass, lowpass],
      starters: [() => noise.start()],
    };
  }

  private createOceanChain(): SoundChain {
    // Ocean: calm wash with slow wave motion
    const noise = new Tone.Noise('pink');
    const bandpass = new Tone.Filter({
      type: 'bandpass',
      frequency: 400,
      Q: 0.8,
    });
    const lowpass = new Tone.Filter({
      type: 'lowpass',
      frequency: 4500,
      rolloff: -12,
    });
    
    // Wave motion on frequency and gain
    const freqLFO = new Tone.LFO({
      frequency: 0.07,
      min: 300,
      max: 550,
    });
    const gainLFO = new Tone.LFO({
      frequency: 0.06,
      min: 0.7,
      max: 0.95,
    });
    const gainNode = new Tone.Gain(0.85);
    
    noise.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(this.masterGain!);
    freqLFO.connect(bandpass.frequency);
    gainLFO.connect(gainNode.gain);
    
    return {
      nodes: [noise, bandpass, lowpass, freqLFO, gainLFO, gainNode],
      starters: [() => noise.start(), () => freqLFO.start(), () => gainLFO.start()],
    };
  }

  private createAirplaneChain(): SoundChain {
    // Airplane cabin: steady rumble, beloved for focus
    const noise = new Tone.Noise('brown');
    const bandpass = new Tone.Filter({
      type: 'bandpass',
      frequency: 200,
      Q: 1.0,
    });
    const lowpass = new Tone.Filter({
      type: 'lowpass',
      frequency: 1500,
      rolloff: -12,
    });
    
    // Very slow volume variation for cabin feel
    const lfo = new Tone.LFO({
      frequency: 0.04,
      min: 0.8,
      max: 0.92,
    });
    const gainNode = new Tone.Gain(0.86);
    
    noise.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(this.masterGain!);
    lfo.connect(gainNode.gain);
    
    return {
      nodes: [noise, bandpass, lowpass, lfo, gainNode],
      starters: [() => noise.start(), () => lfo.start()],
    };
  }

  private async fadeIn(): Promise<void> {
    if (!this.masterGain) return;
    this.masterGain.gain.setValueAtTime(0, Tone.now());
    this.masterGain.gain.rampTo(1, 6); // 6 second fade in
  }

  private async fadeOut(): Promise<void> {
    if (!this.masterGain) return;
    
    return new Promise((resolve) => {
      this.masterGain!.gain.rampTo(0, 4); // 4 second fade out
      
      this.fadeOutTimeout = setTimeout(() => {
        this.disposeCurrentChain();
        resolve();
      }, 4500); // Wait for fade + buffer
    });
  }

  private disposeCurrentChain(): void {
    if (!this.currentChain) return;
    
    // Stop and dispose all nodes
    this.currentChain.nodes.forEach((node) => {
      if ('stop' in node && typeof node.stop === 'function') {
        node.stop();
      }
      node.dispose();
    });
    
    this.currentChain = null;
  }

  async playSound(mode: SoundMode): Promise<void> {
    if (mode === 'none') {
      await this.stopAll();
      return;
    }

    await this.init();
    await this.fadeOut();
    
    // Clear any pending fade timeout
    if (this.fadeOutTimeout) {
      clearTimeout(this.fadeOutTimeout);
      this.fadeOutTimeout = null;
    }

    // Create appropriate chain
    let chain: SoundChain;
    switch (mode) {
      case 'rain':
        chain = this.createRainChain();
        break;
      case 'forest':
        chain = this.createForestChain();
        break;
      case 'cafe':
        chain = this.createCafeChain();
        break;
      case 'brown':
        chain = this.createBrownNoiseChain();
        break;
      case 'pink':
        chain = this.createPinkNoiseChain();
        break;
      case 'ocean':
        chain = this.createOceanChain();
        break;
      case 'airplane':
        chain = this.createAirplaneChain();
        break;
      default:
        return;
    }

    this.currentChain = chain;
    
    // Start all oscillators/LFOs
    chain.starters.forEach((starter) => starter());
    
    // Fade in
    await this.fadeIn();
    
    this.currentMode = mode;
  }

  async stopAll(): Promise<void> {
    if (this.currentMode === 'none') return;
    
    await this.fadeOut();
    this.currentMode = 'none';
  }

  setVolume(volumePercent: number): void {
    if (!this.masterGain) return;
    
    if (volumePercent === 0) {
      this.masterGain.gain.rampTo(0, 0.5);
      return;
    }
    
    // Convert 0-100 to linear gain (0.0 to 1.0), clamped to prevent distortion
    // At 100%, gain is 0.5 (-6dB) for safety headroom
    const linearGain = Math.min(0.5, volumePercent / 200);
    this.masterGain.gain.rampTo(linearGain, 0.5);
  }

  getCurrentMode(): SoundMode {
    return this.currentMode;
  }

  dispose(): void {
    if (this.fadeOutTimeout) {
      clearTimeout(this.fadeOutTimeout);
    }
    
    this.disposeCurrentChain();
    
    if (this.masterGain) {
      this.masterGain.dispose();
      this.masterGain = null;
    }
    if (this.limiter) {
      this.limiter.dispose();
      this.limiter = null;
    }
    
    this.isInitialized = false;
  }
}

export const ambientSound = new AmbientSoundService();
