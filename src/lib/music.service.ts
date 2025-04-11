import * as telegram from 'telegram';
import { EventHandler } from "./event-handler";
import { TelegramService } from "./telegram.service";
import { MusicModel } from '$models/music.model';
import { plainToInstance } from 'class-transformer';
import { MessageModel } from '$models/message.model';

export enum MusicServiceEvents {
	ADDED_TO_PLAYLIST = 'added-to-playlist',
	REMOVED_FROM_PLAYLIST = 'removed-from-playlist',
  MUSIC_CHANGED = 'music-changed',
  VOLUME_CHANGED = 'volume-changed',
  LOOP_CHANGED = 'loop-changed',
}

interface MusicServiceEventsDeclaration {
  [MusicServiceEvents.ADDED_TO_PLAYLIST]: MusicModel;
  [MusicServiceEvents.REMOVED_FROM_PLAYLIST]: MusicModel;
  [MusicServiceEvents.MUSIC_CHANGED]: MusicModel | null;
  [MusicServiceEvents.VOLUME_CHANGED]: number;
  [MusicServiceEvents.LOOP_CHANGED]: boolean;
}

const STORAGEABLE_SETTINGS = [
  'volume',
  'loop',
] as const;

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
  getAudio(music: MusicModel) {
    if (!music.isSupported) {
      return null;
    }

    if (this.audioElements[music.id]) {
      return this.audioElements[music.id];
    }

    this.mediaSources[music.id] ??= new MediaSource();

    const audioElement = new Audio();
    audioElement.src = URL.createObjectURL(this.mediaSources[music.id]);
    audioElement.addEventListener('play', () => {
      if (this.settings.music && this.settings.music !== music) {
        this.getAudio(this.settings.music)?.pause();
      }
      this.settings.music = music;
      audioElement.volume = this.settings.volume;
      audioElement.loop = this.settings.loop;
    });

    audioElement.addEventListener('timeupdate', () => {
      const percent = audioElement.currentTime / this.settings.music!.duration;
      if (percent < 1) return;

      audioElement.currentTime = 0;

      if (this.settings.loop) {
        audioElement.play();
        return;
      }

      audioElement.pause();
    });

    this.audioElements[music.id] = audioElement;

    return audioElement;
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
  async beginStream(music: MusicModel) {
    if (this.mediaSources?.[music.id].sourceBuffers.length || 0 > 0) {
      return;
    }

    this.mediaSources[music.id] ??= new MediaSource();
    const mediaSource = this.mediaSources[music.id];
    mediaSource.addSourceBuffer(music.mimeType);

    const { document: doc } = music;
		const requestConfig = this.createMediaRequestConfig(doc);

		for await (const chunk of this.telegramService.client.iterDownload(requestConfig as any)) {
			mediaSource.sourceBuffers[0].appendBuffer(chunk);
		}

    // TODO Add the downloaded buffer to the cache
    //      I'm not sure how to save the downloaded buffer to the cache :C
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
