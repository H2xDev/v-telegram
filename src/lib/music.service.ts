import * as telegram from 'telegram';
import { EventHandler } from "./event-handler";
import { TelegramService } from "./telegram.service";
import { MusicModel } from '$models/music.model';
import { plainToInstance } from 'class-transformer';
import { MessageModel } from '$models/message.model';
import { DBBanks, DBService } from './db.service';

export enum MusicServiceEvents {
  MUSIC_CHANGED = 'music-changed',
  VOLUME_CHANGED = 'volume-changed',
  LOOP_CHANGED = 'loop-changed',
  PLAY_STARTED = 'play-started',
  PLAY_PAUSED = 'play-paused',
  PLAYBACK_FINISHED = 'playback-finished',
}

interface MusicServiceEventsDeclaration {
  [MusicServiceEvents.MUSIC_CHANGED]: MusicModel | null;
  [MusicServiceEvents.VOLUME_CHANGED]: number;
  [MusicServiceEvents.LOOP_CHANGED]: boolean;
  [MusicServiceEvents.PLAY_STARTED]: MusicModel;
  [MusicServiceEvents.PLAY_PAUSED]: MusicModel;
}

const STORAGEABLE_SETTINGS = [
  'volume',
  'loop',
] as const;

export const RECOMMENDED_CHANNELS = [
  'ambientdark',
  'space_ambient_music',
];

export interface MusicSettings {
  music: MusicModel | null;
  volume: number;
  loop: boolean;
}

/**
 * A singleton service that handles music management and playback
 */
export class MusicService extends EventHandler<MusicServiceEventsDeclaration> {
  static instance = new MusicService;
	private telegramService = new TelegramService;
  private dbService = new DBService;

  private musicLists: Record<string, MessageModel[]> = {};
  private mediaSources: Record<string, MediaSource> = {};
  private audioElements: Record<string, HTMLAudioElement> = {};

  settings = new Proxy<MusicSettings>({
    music: null,
    volume: 1,
    loop: false,
  }, {
    get: <T extends keyof MusicSettings>(target: MusicSettings, prop: T) => {
      const storageItem = `vt.musicService.${prop}`;

      if (STORAGEABLE_SETTINGS.includes(prop as any)) {
        const storedValue = localStorage.getItem(storageItem);
        if (storedValue) {
          target[prop] = JSON.parse(storedValue);
        }
      }

      return target[prop];
    },
    set: <T extends keyof MusicSettings>(target: MusicSettings, prop: T, value: MusicSettings[T]) => {
      target[prop] = value;
      const storageItem = `vt.musicService.${prop}`;
      const event = prop + '-changed';

      if (STORAGEABLE_SETTINGS.includes(prop as any)) {
        localStorage.setItem(storageItem, JSON.stringify(value));
      }

      this.trigger(event, target[prop]);
      return true;
    }
  })

  constructor() {
    if (MusicService.instance) return MusicService.instance;
    super();

    this.on(MusicServiceEvents.VOLUME_CHANGED, (volume) => {
      if (!this.settings.music) return;
      const audio = this.getAudio(this.settings.music);
      if (!audio) return;
      audio.volume = volume;
    });

    this.on(MusicServiceEvents.LOOP_CHANGED, (loop) => {
      if (!this.settings.music) return;
      const audio = this.getAudio(this.settings.music);
      if (!audio) return;
      audio.loop = loop;
    });
  }

  /**
   * Returns an audio element for the given music instance
   * If the audio doesn't exist, it creates a new one and returns it and 
   * next method call will return the same audio element
   */
  getAudio(music: MusicModel | null = this.settings.music) {
    if (!music) return;

    if (this.audioElements[music.id]) {
      return this.audioElements[music.id];
    }

    this.mediaSources[music.id] ??= new MediaSource();

    const audioElement = new Audio();

    audioElement.src = URL.createObjectURL(this.mediaSources[music.id]);
    audioElement.addEventListener('play', this.onMusicPlay.bind(this, music, audioElement));
    audioElement.addEventListener('pause', this.trigger.bind(this, MusicServiceEvents.PLAY_PAUSED, music));
    audioElement.addEventListener('timeupdate', this.onMusicTimeUpdate.bind(this, audioElement));

    this.audioElements[music.id] = audioElement;

    return audioElement;
  }

  private onMusicTimeUpdate(audioElement: HTMLAudioElement) {
      const percent = audioElement.currentTime / this.settings.music!.duration;
      if (percent < 1) return;

      audioElement.currentTime = 0;

      if (this.settings.loop) {
        audioElement.play();
        return;
      }

      audioElement.pause();
      this.trigger(MusicServiceEvents.PLAYBACK_FINISHED, this.settings.music);
  }

  private onMusicPlay(music: MusicModel, audioElement: HTMLAudioElement) {
      if (this.settings.music && this.settings.music !== music) {
        this.getAudio(this.settings.music)?.pause();
      }

      this.beginStream(music!);

      this.settings.music = music;
      audioElement.volume = this.settings.volume;
      audioElement.loop = this.settings.loop;
      this.trigger(MusicServiceEvents.PLAY_STARTED, music);
  }

  /**
   * Returns music list from the current user
   */
  async getMusicList(id: string | number = "me", offsetId?: number, search?: string) {
    const filter = new telegram.Api.InputMessagesFilterMusic()
		const res = await this.telegramService.client.invoke(
			new telegram.Api.messages.Search({
				filter,
				limit: 100,
				peer: id,
        offsetId,
				q: search,
			})
    ) as { messages: any[] };

		const list = plainToInstance(MessageModel, res.messages, { excludeExtraneousValues: true })
    this.musicLists[id] ??= [];
    this.musicLists[id] = [...this.musicLists[id], ...list];

    return list;
  }

  /**
   * Starts streaming the music from the given document 
   * into the already created media source
   */
  private async beginStream(music: MusicModel) {
    if (this.mediaSources?.[music.id].sourceBuffers.length || 0 > 0) {
      return;
    }

    this.mediaSources[music.id] ??= new MediaSource();
    const mediaSource = this.mediaSources[music.id];
    const sourceBuffer = mediaSource.addSourceBuffer(music.mimeType);

    const { document: doc } = music;
		const requestConfig = this.createMediaRequestConfig(doc);

    const cachedData = await this.dbService.get(music.id, DBBanks.MUSIC);

    if (cachedData && cachedData.buffer) {
      const buffer = cachedData.buffer;
      sourceBuffer.appendBuffer(buffer);

      sourceBuffer.addEventListener('updateend', () => {
        mediaSource.endOfStream();
        music.duration = mediaSource.duration;
      }, { once: true });

      console.log('Loaded music from db', music.id);

      return;
    }

    const buffer = [];
		for await (const chunk of this.telegramService.client.iterDownload(requestConfig as any)) {
      if (music.duration) {
			  sourceBuffer.appendBuffer(chunk.buffer);
      }

      buffer.push(chunk);

		}

    const bufferToSave = buffer.reduce((acc, chunk) => {
      const newBuffer = new Uint8Array(acc.length + chunk.length);
      newBuffer.set(acc, 0);
      newBuffer.set(chunk, acc.length);
      return newBuffer;
    }, new Uint8Array(0));

    if (!music.duration) {
      sourceBuffer.appendBuffer(bufferToSave);
    }

    sourceBuffer.addEventListener('updateend', () => {
      mediaSource.endOfStream();
      music.duration = mediaSource.duration;
    }, { once: true });

    this.dbService.save({ id: music.id, buffer: bufferToSave }, DBBanks.MUSIC);
	}

  private createMediaRequestConfig(doc: telegram.Api.Document) {
		return {
			file: new telegram.Api.InputDocumentFileLocation({
				id: (doc.id as any),
				accessHash: (doc.accessHash as any),
				fileReference: doc.fileReference,
				thumbSize: '',
			}),
			requestSize: 1024 * 1024 / 2,
			limit: doc.size,
		}
	}
}
