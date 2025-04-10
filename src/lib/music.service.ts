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
}

interface MusicServiceEventsDeclaration {
  [MusicServiceEvents.ADDED_TO_PLAYLIST]: MusicModel;
  [MusicServiceEvents.REMOVED_FROM_PLAYLIST]: MusicModel;
  [MusicServiceEvents.MUSIC_CHANGED]: MusicModel | null;
}

export class MusicService extends EventHandler<MusicServiceEventsDeclaration> {
  static instance = new MusicService;
	private telegramService = new TelegramService;

  private musicLists: Record<string, MessageModel[]> = {};
  private currentMusic_: MusicModel | null = null;
  private mediaSources: Record<string, MediaSource> = {};
  private audioElements: Record<string, HTMLAudioElement> = {};

  get currentMusic() {
    return this.currentMusic_;
  }

  set currentMusic(music: MusicModel | null) {
    this.currentMusic_ = music;
    this.trigger(MusicServiceEvents.MUSIC_CHANGED, music);
  }

  constructor() {
    if (MusicService.instance) return MusicService.instance;
    super();
  }

  /**
   * Creates audio element for the given music instance
   * Returns null in case the music's mimeType is not supported by MediaSource
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
      if (this.currentMusic) {
        this.getAudio(this.currentMusic)?.pause();
      }
      this.currentMusic = music;
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
