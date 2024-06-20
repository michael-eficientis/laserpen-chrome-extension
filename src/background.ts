class LaserController {
	async init() {
		await chrome.action.setBadgeText({ text: 'OFF' });
	}

	async toggle(tabId: number | undefined) {
		if (!tabId) return;

		const prevState = await chrome.action.getBadgeText({ tabId });
		const nextState = prevState === 'ON' ? 'OFF' : 'ON';

		await chrome.action.setBadgeText({
			tabId,
			text: nextState,
		});

		await chrome.scripting.executeScript({
			target: { tabId: tabId },
			func: toggleLaser,
			args: [nextState === 'ON'],
		});
	}
}

function toggleLaser(enable: boolean) {
	const event = new CustomEvent('toggleLaser', { detail: { enable } });
	window.dispatchEvent(event);
}

const controller = new LaserController();

chrome.runtime.onInstalled.addListener(() => {
	controller.init();
});

chrome.action.onClicked.addListener(async (tab) => {
	await controller.toggle(tab?.id);
});
