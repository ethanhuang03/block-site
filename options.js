"use strict";

/* global chrome, window, document */

const blockedList = document.getElementById("blocked-list");
const permanentblockedList = document.getElementById("permanent-blocked-list");
const resolutionSelect = document.getElementById("resolution-select");
const enabledToggle = document.getElementById("enabled-toggle");

const meritWeight = document.getElementById("merit-weight");
const demeritWeight = document.getElementById("demerit-weight");
const maxPoint = document.getElementById("max-point");
const resetAfterClosureToggle = document.getElementById("reset-after-closure-toggle");
const settingEnabled = document.getElementById("setting-enabled");
const autofill = document.getElementById("autofill");


const COMMON_DISTRACTORS = [
	"facebook.com",
	"twitter.com",
	"instagram.com",
	"youtube.com",
	"reddit.com",
	"messenger.com",
	"snapchat.com",
	"whatsapp.com",
	"tiktok.com",
	"discord.com"
];

function updateBadge(){
	chrome.storage.local.get("score", function(local) {
		chrome.action.setBadgeText({
			text: local.score.toString(10)
		});
	});
}

function block_settings(setting_enabled){
	if (setting_enabled){
		document.getElementById("blocked-list").disabled = true;
		document.getElementById("enabled-toggle").disabled = true;
		document.getElementById("merit-weight").disabled = true;
		document.getElementById("demerit-weight").disabled = true;
		document.getElementById("max-point").disabled = true;
	}
	else {
		document.getElementById("blocked-list").disabled = false;
		document.getElementById("enabled-toggle").disabled = false;
		document.getElementById("merit-weight").disabled = false;
		document.getElementById("demerit-weight").disabled = false;
		document.getElementById("max-point").disabled = false;
		updateBadge();
	}
}

blockedList.placeholder = [
	"youtube.com",
	"!https://www.youtube.com/watch?v=dQw4w9WgXcQ",
	"twitter.com",
	"facebook.com",
	"messenger.com",
	"discord.com",
	"instagram.com"
].join("\n");

blockedList.addEventListener("change", (event) => {
	const blocked = event.target.value.split("\n").map(s => s.trim()).filter(Boolean);
	chrome.storage.local.set({
		blocked
	});
});

permanentblockedList.addEventListener("change", (event) => {
	const permanent_blocked = event.target.value.split("\n").map(s => s.trim()).filter(Boolean);
	chrome.storage.local.set({
		permanent_blocked
	});
});

resolutionSelect.addEventListener("change", (event) => {
	const resolution = event.target.value;

	chrome.storage.local.set({
		resolution
	});
});

enabledToggle.addEventListener("change", (event) => {
	const enabled = event.target.checked;

	chrome.storage.local.set({
		enabled
	});
});

meritWeight.addEventListener("change", (event) => {
	const merit_weight = event.target.value;

	chrome.storage.local.set({
		merit_weight
	});
});

demeritWeight.addEventListener("change", (event) => {
	const demerit_weight = event.target.value;

	chrome.storage.local.set({
		demerit_weight
	});
});

maxPoint.addEventListener("change", (event) => {
	const max_point = event.target.value;

	chrome.storage.local.set({
		max_point
	});
});

resetAfterClosureToggle.addEventListener("change", (event) => {
	const reset_after_closure = event.target.checked;

	chrome.storage.local.set({
		reset_after_closure
	});
});

settingEnabled.addEventListener("click", (event) => {
	const setting_enabled = event.target.checked;

	chrome.storage.local.set({
		setting_enabled
	});

	if(!setting_enabled){
		chrome.storage.local.set({
			score: 0
		});
	}

	block_settings(setting_enabled);
});

autofill.addEventListener("click", (event) => {
	const autofill_enabled = event.target.checked;

	chrome.storage.local.set({
		autofill_enabled
	});

	if(autofill_enabled){
		for(let i = 0; i < COMMON_DISTRACTORS.length; i++){
			blockedList.value += COMMON_DISTRACTORS[i] + "\n";
			const blocked = blockedList.value.split("\n").map(s => s.trim()).filter(Boolean);
			chrome.storage.local.set({
				blocked
			});
		}
		document.getElementById("autofill").disabled = true;
	}
});

window.addEventListener("DOMContentLoaded", () => {
	chrome.storage.local.get(["enabled", "blocked", "resolution", "merit_weight", "demerit_weight", "max_point", "reset_after_closure", "setting_enabled", "permanent_blocked"], function(local) {
		const {
			enabled,
			blocked,
			resolution,
			merit_weight,
			demerit_weight,
			max_point,
			reset_after_closure,
			setting_enabled,
			permanent_blocked
		} = local;

		if (!Array.isArray(blocked)) {
			return;
		}

		// blocked
		var value = blocked.join("\r\n"); // display every blocked in new line
		blockedList.value = value;

		if (Array.isArray(permanent_blocked)) {
			// permanent blocked
			var permanentblocked_list = permanent_blocked.join("\r\n"); // display every permanent blocked in new line
			permanentblockedList.value = permanentblocked_list;
		}

		// resolution
		resolutionSelect.value = resolution;

		// enabled
		enabledToggle.checked = enabled;
		
		// meritWeight
		if(merit_weight == null || merit_weight == ""){
			chrome.storage.local.set({
				merit_weight: meritWeight.value
			});
		}
		else {
			meritWeight.value = merit_weight;
		}

		// demeritWeight
		if(demerit_weight == null || demerit_weight == ""){
			chrome.storage.local.set({
				demerit_weight: demeritWeight.value
			});
		}
		else {
			demeritWeight.value = demerit_weight;
		}

		// maxPoint
		maxPoint.value = max_point;

		// resetAfterClosureToggle
		resetAfterClosureToggle.checked = reset_after_closure;

		// settingEnabled
		settingEnabled.checked = setting_enabled;
		block_settings(setting_enabled);

		// UI ready
		document.body.classList.add("ready");
	});
});
