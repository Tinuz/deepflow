import * as Tone from 'tone';

export type SoundMode = 'none' | 'rain' | 'forest' | 'coffee';

class AmbientSoundService {
  private rainNoise: Tone.Noise | null = null;
  private rainFilter: Tone.Filter | null = null;
  private forestNoise: Tone.Noise | null = null;
  private forestFilter: Tone.Filter | null = null;
  private forestLFO: Tone.LFO | null = null;
  private coffeeNoise: Tone.Noise | null = null;
  private coffeeFilter: Tone.Filter | null = null;
  private currentMode: SoundMode = 'none';
  private volume: Tone.Volume | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    await Tone.start();
    this.volume = new Tone.Volume(-10).toDestination();
    this.isInitialized = true;
  }

  async playRain(): Promise<void> {
    await this.init();
    this.stopAll();
    
    // Pink noise filtered to sound like rain
    this.rainNoise = new Tone.Noise('pink').start();
    this.rainFilter = new Tone.Filter({
      type: 'bandpass',
      frequency: 800,
      Q: 0.5,
    });
    
    this.rainNoise.connect(this.rainFilter);
    this.rainFilter.connect(this.volume!);
    
    this.currentMode = 'rain';
  }

  async playForest(): Promise<void> {
    await this.init();
    this.stopAll();
    
    // Brown noise with slow modulation for wind/leaves
    this.forestNoise = new Tone.Noise('brown').start();
    this.forestFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: 500,
      Q: 1,
    });
    
    this.forestLFO = new Tone.LFO({
      frequency: 0.1,
      min: 300,
      max: 700,
    }).start();
    
    this.forestLFO.connect(this.forestFilter.frequency);
    this.forestNoise.connect(this.forestFilter);
    this.forestFilter.connect(this.volume!);
    
    this.currentMode = 'forest';
  }

  async playCoffee(): Promise<void> {
    await this.init();
    this.stopAll();
    
    // White noise filtered to sound like café ambience
    this.coffeeNoise = new Tone.Noise('white').start();
    this.coffeeFilter = new Tone.Filter({
      type: 'bandpass',
      frequency: 1200,
      Q: 0.3,
    });
    
    this.coffeeNoise.connect(this.coffeeFilter);
    this.coffeeFilter.connect(this.volume!);
    
    this.currentMode = 'coffee';
  }

  stopAll(): void {
    // Stop rain
    if (this.rainNoise) {
      this.rainNoise.stop();
      this.rainNoise.dispose();
      this.rainNoise = null;
    }
    if (this.rainFilter) {
      this.rainFilter.dispose();
      this.rainFilter = null;
    }
    
    // Stop forest
    if (this.forestNoise) {
      this.forestNoise.stop();
      this.forestNoise.dispose();
      this.forestNoise = null;
    }
    if (this.forestFilter) {
      this.forestFilter.dispose();
      this.forestFilter = null;
    }
    if (this.forestLFO) {
      this.forestLFO.stop();
      this.forestLFO.dispose();
      this.forestLFO = null;
    }
    
    // Stop coffee
    if (this.coffeeNoise) {
      this.coffeeNoise.stop();
      this.coffeeNoise.dispose();
      this.coffeeNoise = null;
    }
    if (this.coffeeFilter) {
      this.coffeeFilter.dispose();
      this.coffeeFilter = null;
    }
    
    this.currentMode = 'none';
  }

  setVolume(volumePercent: number): void {
    if (!this.volume) return;
    // Convert 0-100 to dB (-60 to 0)
    const db = volumePercent === 0 ? -Infinity : (volumePercent / 100) * 60 - 60;
    this.volume.volume.value = db;
  }

  getCurrentMode(): SoundMode {
    return this.currentMode;
  }

  dispose(): void {
    this.stopAll();
    if (this.volume) {
      this.volume.dispose();
      this.volume = null;
    }
    this.isInitialized = false;
  }
}

export const ambientSound = new AmbientSoundService();
