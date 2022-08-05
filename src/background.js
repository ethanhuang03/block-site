"use strict";

/* global chrome */

const extensionApi =
	(typeof browser === 'object' &&
		typeof browser.runtime === 'object' &&
		typeof browser.runtime.getManifest === 'function') ? browser :
	(typeof chrome === 'object' &&
		typeof chrome.runtime === 'object' &&
		typeof chrome.runtime.getManifest === 'function') ? chrome :
	console.log('Cannot find extensionApi under namespace "browser" or "chrome"');

const CLOSE_TAB = "CLOSE_TAB";
const SHOW_BLOCKED_INFO_PAGE = "SHOW_BLOCKED_INFO_PAGE";

const RESOLUTIONS = [
	SHOW_BLOCKED_INFO_PAGE,
	CLOSE_TAB,
];

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

extensionApi.runtime.onInstalled.addListener(function() {
	extensionApi.storage.local.get(["permanent_blocked", "enabled", "blocked_list", "resolution"], function(local) {
		if (typeof local.enabled !== "boolean") {
			extensionApi.storage.local.set({
				enabled: false
			});
		}

		if (!Array.isArray(local.blocked_list)) {
			extensionApi.storage.local.set({
				blocked_list: []
			});
		}

		if (!Array.isArray(local.blocked_list)) {
			extensionApi.storage.local.set({
				permanent_blocked: []
			});
		}

		if (!RESOLUTIONS.includes(local.resolution)) {
			extensionApi.storage.local.set({
				resolution: CLOSE_TAB
			});
		}
	});

	extensionApi.storage.local.set({
		score: 0
	});

	extensionApi.tabs.create({
		url: extensionApi.runtime.getURL("src/ui/options.html")
	});
});

extensionApi.runtime.onStartup.addListener(function() {
	extensionApi.storage.local.get("reset_after_closure", function(local) {
		console.log(local.reset_after_closure);
		if (local.reset_after_closure == true) {
			extensionApi.storage.local.set({
				score: 0
			});
			extensionApi.action.setBadgeText({
				text: "0"
			});
		}
	});
});

extensionApi.webRequest.onBeforeRequest.addListener(
	function(details) {
		console.log("kile")
		extensionApi.tabs.query({}, function(tabs) {
			for (let i = 0; i < tabs.length; i++) {
				var tab = tabs[i];
				var tabId = tab.id;
				var url = tab.url;
				
				if (!url || !url.startsWith("http")) {
					continue;
				}
				const normalizedUrl = normalizeUrl(url);
				extensionApi.storage.local.get(["permanent_blocked", "blocked_list", "resolution", "demerit_weight", "score", "enabled"], function(local) {
					var rules = [];
					if (local.enabled && local.score <= 0) {
						rules = getRules(local.blocked_list).concat(getRules(local.permanent_blocked));
						
					}
					else {
						rules = getRules(local.permanent_blocked); 
					}
					
					console.log(rules);
					console.log(normalizedUrl);

					const foundRule = rules.find((rule) => normalizedUrl.startsWith(rule.path) || normalizedUrl.endsWith(rule.path));
					if (foundRule || !foundRule.type === "allow") {
						block_website(local.resolution, url, tabId, parseFloat(local.score), parseFloat(local.demerit_weight), true);
					}
				});
				block_blacklist("block_adult", "blacklist/adult.txt", url, tabId);
			}
		});
	}, {
		urls: ["<all_urls>"]
	});

extensionApi.action.setBadgeBackgroundColor({
	color: "#777"
});

function block_blacklist(category, blacklist, url, tabId) {
	const normalizedUrl = normalizeUrl(url);
	extensionApi.storage.local.get([category, "resolution", "demerit_weight", "score"], function(local) {
		if (local[category]) {
			fetch(chrome.runtime.getURL(blacklist))
				.then(response => response.text())
				.then(function(text) {
					const rules = getRules(text.split(/\r?\n/));
					console.log(rules)
					const foundRule = rules.find((rule) => normalizedUrl.startsWith(rule.path) || normalizedUrl.endsWith(rule.path));
					if (foundRule || !foundRule.type === "allow") {
						block_website(local.resolution, url, tabId, parseFloat(local.score), parseFloat(local.demerit_weight), true);
					}
				});
		}
	});
}

function updateBadge() {
	extensionApi.storage.local.get("score", function(local) {
		extensionApi.action.setBadgeText({
			text: local.score.toString(10)
		});
		console.log(local.score);
	});
}

function block_website(resolution, url, tabId, score, demerit_weight, permanent_blocked) {
	switch (resolution) {
		case CLOSE_TAB:
			if (score > 0 && !permanent_blocked) {
				extensionApi.storage.local.set({
					score: score - parseFloat(demerit_weight)
				});
			} else {
				extensionApi.tabs.remove(tabId);
				break;
			}
			case SHOW_BLOCKED_INFO_PAGE:
				if (score > 0 && !permanent_blocked) {
					extensionApi.storage.local.set({
						score: score - parseFloat(demerit_weight)
					});
				} else {
					extensionApi.tabs.update(tabId, {
						url: `${extensionApi.runtime.getURL("src/blocked_page/blocked.html")}?url=${url}`
					});
					break;
				}
	}
}

function updateScore(url, tabId, subtract_only) {
	const normalizedUrl = normalizeUrl(url);
	extensionApi.storage.local.get(["enabled", "blocked_list", "resolution", "merit_weight", "demerit_weight", "max_point", "score", "permanent_blocked"], function(local) {
		const {
			enabled,
			blocked_list,
			resolution,
			merit_weight,
			demerit_weight,
			max_point,
			score
		} = local;

		if (!enabled) {
			return;
		}

		const rules = getRules(blocked_list);
		const foundRule = rules.find((rule) => normalizedUrl.startsWith(rule.path) || normalizedUrl.endsWith(rule.path));
		if (!foundRule || foundRule.type === "allow") {
			if (!subtract_only) {
				if (score >= parseFloat(max_point)) {
					extensionApi.storage.local.set({
						score: parseFloat(max_point)
					});
				} else {
					extensionApi.storage.local.set({
						score: score + parseFloat(merit_weight)
					});
				}
			}
			return;
		}

		if (!Array.isArray(blocked_list) || blocked_list.length === 0 || !RESOLUTIONS.includes(resolution)) {
			if (!subtract_only) {
				if (score >= parseFloat(max_point)) {
					extensionApi.storage.local.set({
						score: parseFloat(max_point)
					});
				} else {
					extensionApi.storage.local.set({
						score: score + parseFloat(merit_weight)
					});
				}
			}
			return;
		}
		block_website(resolution, url, tabId, score, demerit_weight, false);
	});
}

function main() {
	extensionApi.tabs.query({
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

	extensionApi.tabs.query({
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

updateBadge();
main();
extensionApi.alarms.create("delay", {
	periodInMinutes: 1
});
extensionApi.alarms.onAlarm.addListener((alarms) => {
	if (alarms.name === "delay") {
		main();
	}
});