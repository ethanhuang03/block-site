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

function background_blocker() {
	extensionApi.tabs.query({active: true}, function(tabs) {
		for (let i = 0; i < tabs.length; i++) {
			var tab = tabs[i];
			var tabId = tab.id;
			var url = tab.url;
			
			if (!url || !url.startsWith("http")) {
				continue;
			}

			updateScore(url, tabId, true, true);
		}
	});
}

function updateBadge() {
	extensionApi.storage.local.get("score", function(local) {
		extensionApi.action.setBadgeText({
			text: local.score.toString(10)
		});
		console.log("SCORE: " + local.score);
	});
}

function block_website(resolution, url, tabId, score, demerit_weight, permanent_blocked, no_subtract) {
	var temp_score = score;
	if (score > 0 && !permanent_blocked && !no_subtract) {
		temp_score = score - parseFloat(demerit_weight)
		if (temp_score < 0) {
			temp_score = 0;
		}
		extensionApi.storage.local.set({
			score: temp_score
		});
	}
	updateBadge();
	if (temp_score <= 0 || permanent_blocked) {
		switch (resolution) {
			case CLOSE_TAB:
				extensionApi.tabs.remove(tabId);
				break;
			case SHOW_BLOCKED_INFO_PAGE:
				extensionApi.tabs.update(tabId, {
					url: `${extensionApi.runtime.getURL("src/blocked_page/blocked.html")}?url=${url}`
				});
				break;
		}
	}
}

function updateScore(url, tabId, subtract_only, no_subtract) {
	const normalizedUrl = normalizeUrl(url);
	extensionApi.storage.local.get(["enabled", "blocked_list", "resolution", "merit_weight", "demerit_weight", "max_point", "score", "is_idle", "permanent_blocked"], function(local) {
		const {
			enabled,
			blocked_list,
			resolution,
			merit_weight,
			demerit_weight,
			max_point,
			score, 
			is_idle,
			permanent_blocked
		} = local;

		if (!enabled) {
			return;
		}

		const temp_rules = getRules(blocked_list);
		const perm_rules = getRules(permanent_blocked);

		const temp_foundRule = temp_rules.find((rule) => normalizedUrl.startsWith(rule.path) || normalizedUrl.endsWith(rule.path));
		const perm_foundRule = perm_rules.find((rule) => normalizedUrl.startsWith(rule.path) || normalizedUrl.endsWith(rule.path));

		if (perm_foundRule && perm_foundRule.type === "block") {
			block_website(resolution, url, tabId, score, demerit_weight, true, no_subtract);
		}
		if (temp_foundRule && temp_foundRule.type === "block") {
			block_website(resolution, url, tabId, score, demerit_weight, false, no_subtract);
		}
		else {
			if (!subtract_only) {
				if (score >= parseFloat(max_point)) {
					extensionApi.storage.local.set({
						score: parseFloat(max_point)
					});
				} else if(!is_idle){
					extensionApi.storage.local.set({
						score: score + parseFloat(merit_weight)
					});
				}
			}
			return;
		}
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
		updateScore(url, tabId, false, false);
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
			updateScore(url, tabId, true, false);
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

	extensionApi.storage.local.set({
		is_idle: false
	});

	extensionApi.tabs.create({
		url: extensionApi.runtime.getURL("src/ui/settings.html")
	});
});

extensionApi.runtime.onStartup.addListener(function() {
	extensionApi.storage.local.get("reset_after_closure", function(local) {
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

extensionApi.idle.setDetectionInterval(15);
extensionApi.idle.onStateChanged.addListener(function(newState) {
	if(newState === "active") {
		extensionApi.storage.local.set({
			is_idle: false
		});
		extensionApi.action.setBadgeBackgroundColor({
			color: "#777"
		});
		extensionApi.action.setIcon({ path: {128: "images/green_shield.png"} });	
		console.log("NOT IDLE"); 
	}
	else {
		extensionApi.storage.local.set({
			is_idle: true
		});
		extensionApi.action.setBadgeBackgroundColor({
			color: "#fd180b"
		});
		extensionApi.action.setIcon({ path: {128: "images/red_shield.png"} });
		console.log("IS IDLE");
	}
});

extensionApi.tabs.onActivated.addListener(
	function(activeInfo) {
		background_blocker();
	}
);

extensionApi.webRequest.onBeforeRequest.addListener(
	function(details) {
		background_blocker();
	}, {
		urls: ["<all_urls>"]
});

extensionApi.action.setBadgeBackgroundColor({
	color: "#777"
});
