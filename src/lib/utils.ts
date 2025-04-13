export const formatTime = (time: number) => {
  if (!time) return '--:--';

	const hour = 60 ** 2;

	const string = new Date(time * 1000)
		.toISOString().split('T')[1]
		.split('.')[0];

	if (time >= hour) {
		return string;
	}

	return string.slice(3);
}

const EntityProcessors: Record<string, (ent: any, fragment: string) => String> = {
	'MessageEntityTextUrl': (entity, fragment) => `<a href="${entity.url}" target="_blank">${fragment}</a>`,
	'MessageEntityUrl': (entity, fragment) => `<a href="${fragment}" target="_blank">${fragment}</a>`,
	'MessageEntityBold': (_: any, fragment) => `<b>${fragment}</b>`,
	'MessageEntityHashtag': (_: any, fragment: string) => `<a href="?hashtag=${fragment}" target="_blank">${fragment}</a>`
}

// FIXME Currently any word range can have only one style applied to id. 
//		 For now i didn't come up with a good way to handle multiple 
//		 styles on the same word range.
export const formatMarkdown = (src: string, entities = []) => {
	let msg = src;
	let replaceDelta = 0;

	const offsetProcessed: number[] = [];
	
	entities.forEach((entity: any) => {
		if (!EntityProcessors[entity.className]) return;
		if (offsetProcessed.includes(entity.offset)) return;

		const fragment = src.substring(entity.offset, entity.offset + entity.length);
		const result = EntityProcessors[entity.className](entity, fragment);
		const delta = result.length - fragment.length;

		const before = msg.substring(0, entity.offset + replaceDelta);
		const after = msg.substring(entity.offset + entity.length + replaceDelta);

		msg = before + result + after;

		replaceDelta += delta;

		offsetProcessed.push(entity.offset);
	});
	
	return (msg || '')
		.replace(/\n/g, '<br />');
}

export const getNearScrollableElement = (el: any): HTMLElement | Window => {
	if (el === document.documentElement) return window;

	if (el.scrollHeight > el.clientHeight) {
		return el;
	}

	return getNearScrollableElement(el.parentNode!) || window;
}
