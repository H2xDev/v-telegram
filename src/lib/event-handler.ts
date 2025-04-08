const EVENT_PREFIX = 'app-';

export class EventHandler<EInterface extends Record<string, any>> {
	/**
	 * Defines an event listener for a specific event and returns unsubscribe function.
	 */
	on<E extends string>(event: E, callback: (data: EInterface[E]) => void, once = false) {
		const actual_event = EVENT_PREFIX + event;
		const handler = (e: Event) => {
			callback((e as CustomEvent).detail);
			if (once) unsub();
		};

		const unsub = window.removeEventListener.bind(window, actual_event, handler);

		window.addEventListener(actual_event, handler);
		return unsub;
	}

	once<E extends string>(event: E, callback: (data: EInterface[E]) => void) {
		return this.on(event, callback, true);
	}

	/**
	 * Triggers an event with the given name and data.
	 */
	protected trigger<E extends string>(event: E, data: EInterface[E]) {
		const actual_event = new CustomEvent(EVENT_PREFIX + event, { detail: data });
		window.dispatchEvent(actual_event);
	}

	/**
	 * Returns a promise that resolves when the event is triggered.
	 */
	forEvent<E extends string>(event: E) {
		return new Promise<EInterface[E]>((resolve) => {
			this.on(event, resolve, true);
		});
	}
}
