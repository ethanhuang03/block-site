"use strict";

/* global chrome */

const CLOSE_TAB = "CLOSE_TAB";
const SHOW_BLOCKED_INFO_PAGE = "SHOW_BLOCKED_INFO_PAGE";

const RESOLUTIONS = [
	SHOW_BLOCKED_INFO_PAGE,
	CLOSE_TAB,
];


chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.local.get(["enabled", "blocked", "resolution"], function(local) {
		if (typeof local.enabled !== "boolean") {
			chrome.storage.local.set({
				enabled: false
			});
		}

		if (!Array.isArray(local.blocked)) {
			chrome.storage.local.set({
				blocked: []
			});
		}

		if (!RESOLUTIONS.includes(local.resolution)) {
			chrome.storage.local.set({
				resolution: CLOSE_TAB
			});
		}
	});

	chrome.storage.local.set({
		score: 0
	});

	chrome.tabs.create({url:chrome.runtime.getURL("options.html")});
});

const __removeProtocol = (url) => url.replace(/^http(s?):\/\//, "");
const __removeWww = (url) => url.replace(/^www\./, "");
const __removeTrailingSlash = (url) => url.endsWith("/") ? url.slice(0, -1) : url;

const normalizeUrl = (url) => [url]
	.map(__removeProtocol)
	.map(__removeWww)
	.map(__removeTrailingSlash)
	.pop();

const getRules = (blocked) => {
	const allowList = blocked
		.filter((item) => item.startsWith("!"))
		.map((item) => normalizeUrl(item.substring(1)));

	const blockList = blocked
		.filter((item) => !item.startsWith("!"))
		.map(normalizeUrl);

	const rules = [
		...allowList.map((path) => ({
			path,
			type: "allow"
		})),
		...blockList.map((path) => ({
			path,
			type: "block"
		})),
	].sort((a, b) => b.path.length - a.path.length); // order the rules by their specificity; the longer the rule, the more specific

	return rules;
};

function updateBadge(){
	chrome.storage.local.get("score", function(local) {
		chrome.action.setBadgeText({
			text: local.score.toString(10)
		});
		console.log(local.score);
	});
}

function updateScore(url, tabId, subtract_only) {
	const normalizedUrl = normalizeUrl(url);
	chrome.storage.local.get(["enabled", "blocked", "resolution", "merit_weight", "demerit_weight", "max_point", "score"], function(local) {
		const {
			enabled,
			blocked,
			resolution,
			merit_weight,
			demerit_weight,
			max_point,
			score
		} = local;

		if (!enabled) {
			return;
		}
		
		if (!Array.isArray(blocked) || blocked.length === 0 || !RESOLUTIONS.includes(resolution)) {
			if (!subtract_only) {
				if (score >= parseFloat(max_point)) {
					chrome.storage.local.set({
						score: parseFloat(max_point)
					});
				} else {
					chrome.storage.local.set({
						score: score + parseFloat(merit_weight)
					});
				}
			}
			return;
		}

		const rules = getRules(blocked);
		const foundRule = rules.find((rule) => normalizedUrl.startsWith(rule.path) || normalizedUrl.endsWith(rule.path));
		if (!foundRule || foundRule.type === "allow") {
			if (!subtract_only) {
				if (score >= parseFloat(max_point)) {
					chrome.storage.local.set({
						score: parseFloat(max_point)
					});
				} else {
					chrome.storage.local.set({
						score: score + parseFloat(merit_weight)
					});
				}
			}
			return;
		}

		switch (resolution) {
			case CLOSE_TAB:
				if (score > 0) {
					chrome.storage.local.set({
						score: score - parseFloat(demerit_weight)
					});
				} else {
					chrome.tabs.remove(tabId);
					break;
				}
				case SHOW_BLOCKED_INFO_PAGE:
					if (score > 0) {
						chrome.storage.local.set({
							score: score - parseFloat(demerit_weight)
						});
					} else {
						chrome.tabs.update(tabId, {
							url: `${chrome.runtime.getURL("blocked.html")}?url=${url}`
						});
						break;
					}
		}
	});
}

function blocker() {
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
		var activeTab = tabs[0];
		var url = activeTab.url
		var tabId = activeTab.id;

		if (!url || !url.startsWith("http")) {
			return;
		}
	
		updateScore(url, tabId, false);
	});

	// keep on deducting points even if tab is not active

	chrome.tabs.query({
		active: false
	}, function(tabs) {
		for (let i = 0; i < tabs.length; i++) {
			var tab = tabs[i];
			var tabId = tab.id;
			var url = tab.url;

			if (!url || !url.startsWith("http")) {
				continue;
			}

			updateScore(url, tabId, true);
		}
	});

	updateBadge();
}

chrome.runtime.onStartup.addListener(function() {
	chrome.storage.local.get("reset_after_closure", function(local) {
		console.log(local.reset_after_closure);
		if (local.reset_after_closure == true) {
			chrome.storage.local.set({
				score: 0
			});
		chrome.action.setBadgeText({
			text: "0"
		});
	}
	});
});

chrome.action.setBadgeBackgroundColor({
	color: "#777"
});
/*
//SERVICE WORKER WORKAROUND
function asyncDelay(msToDelay) {
	return new Promise((success, failure) => {
		var completionTime = new Date().getTime() + msToDelay
		while (true) {
		  if (new Date().getTime() >= completionTime){
			success()
			break
		  }
		}
		failure()
	})
}

async function run() {
	for(let i = 0; i < 60; i++) {
		blocker();
		await asyncDelay(1000);
		chrome.alarms.create(`delay${i}`, { periodInMinutes:1 });
	}
}

chrome.alarms.onAlarm.addListener(() => {
	blocker();
})

*/
updateBadge();
blocker();
chrome.alarms.create("delay", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarms) => {
	if (alarms.name === "delay") {
		blocker();
	}
});

