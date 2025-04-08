import * as telegram from 'telegram';
import { EventHandler } from "./event-handler";
import { DBBanks, DBService } from './db.service';
import { TelegramService } from './telegram.service';
import type { MessageModel } from '../models/message.model';

export enum MediaServiceEvent {
	POST_CHANGED = 'post-changed',
}

interface MediaServiceEventsDeclaration {
	[MediaServiceEvent.POST_CHANGED]: MessageModel | null;
}

export class MediaService extends EventHandler<MediaServiceEventsDeclaration> {
	private dbService = new DBService;
	private telegramService = new TelegramService;
	private currentPost_: MessageModel | null = null;

	get currentPost() {
		return this.currentPost_;
	}

	set currentPost(media: MessageModel | null) {
		this.currentPost_ = media;
		this.trigger(MediaServiceEvent.POST_CHANGED, media);
	}

	async downloadVideo(mediaDocumentData: telegram.Api.MessageMediaDocument) {
		if (!mediaDocumentData.document) return null;

		const id = mediaDocumentData.document?.id.toString();
		const blob = this.dbService.getBlob(id);
		if (blob) return blob;

		const cachedData = await this.dbService.get(id, DBBanks.VIDEOS);
		const buffer = cachedData?.buffer || await this.telegramService.client.downloadMedia(mediaDocumentData);

		if (!cachedData) {
			this.dbService.save({ id, buffer }, DBBanks.VIDEOS);
		}

		if (!blob) {
			this.dbService.saveBlob(id, buffer, (mediaDocumentData.document as any).mimeType);
		}

		return this.dbService.getBlob(id);
	}

	async downloadThumbnail(mediaDocumentData: telegram.Api.MessageMediaDocument) {
		if (!mediaDocumentData.document) return null;
		const id = mediaDocumentData.document?.id.toString() + '_thumb';

		const blob = this.dbService.getBlob(id);
		if (blob) return blob;

		const cachedData = await this.dbService.get(id, DBBanks.PHOTOS);

		if (cachedData && cachedData.buffer) {
			this.dbService.saveBlob(id, cachedData.buffer);
			return this.dbService.getBlob(id);
		}

		const buffer = await this.telegramService.client.downloadMedia(mediaDocumentData, {
			thumb: 1,
		});

		this.dbService.save({ id, buffer }, DBBanks.PHOTOS);

		if (!blob) {
			this.dbService.saveBlob(id, buffer);
		}

		return this.dbService.getBlob(id);
	}

	async downloadPhoto(mediaPhotoData: telegram.Api.MessageMediaPhoto) {
		if (!mediaPhotoData.photo) return null;

		const id = mediaPhotoData.photo.id.toString();
		const blob = this.dbService.getBlob(id);

		if (blob) return blob;

		const cachedData = await this.dbService.get(id, DBBanks.PHOTOS);

		if (cachedData && cachedData.buffer) {
			this.dbService.saveBlob(id, cachedData.buffer);
			return this.dbService.getBlob(id);
		}

		const buffer = await this.telegramService.client.downloadMedia(mediaPhotoData);

		this.dbService.save({ id, buffer }, DBBanks.PHOTOS);

		if (!blob) {
			this.dbService.saveBlob(id, buffer);
		}

		return this.dbService.getBlob(id);
	}

	async downloadFile(mediaDocumentData: telegram.Api.MessageMediaDocument) {
		if (!mediaDocumentData.document) return;

		const id = mediaDocumentData.document?.id.toString();
		const blob = this.dbService.getBlob(id);
		if (blob) return blob;

		const cachedData = await this.dbService.get(id, DBBanks.VIDEOS);

		if (cachedData && cachedData.buffer) {
			this.dbService.saveBlob(id, cachedData.buffer);
			return this.dbService.getBlob(id);
		}

		const buffer = await this.telegramService.client.downloadMedia(mediaDocumentData);

		this.dbService.save({ id, buffer }, DBBanks.VIDEOS);

		if (!blob) {
			this.dbService.saveBlob(id, buffer, (mediaDocumentData.document as any).mimeType);
		}

		return this.dbService.getBlob(id);
	}

	createMediaRequestConfig(media: telegram.Api.Document) {
		return {
			file: new telegram.Api.InputDocumentFileLocation({
				id: (media.id as any),
				accessHash: (media.accessHash as any),
				fileReference: media.fileReference,
				thumbSize: '',
			}),
			requestSize: 1024 * 1024 / 2,
			limit: media.size,
		}
	}
}
