"use strict";

/* global chrome, window, document */

const extensionApi =
	(typeof browser === 'object' &&
		typeof browser.runtime === 'object' &&
		typeof browser.runtime.getManifest === 'function') ? browser :
	(typeof chrome === 'object' &&
		typeof chrome.runtime === 'object' &&
		typeof chrome.runtime.getManifest === 'function') ? chrome :
	console.log('Cannot find extensionApi under namespace "browser" or "chrome"');

const blockedList = document.getElementById("blocked-list");
const permanentblockedList = document.getElementById("permanent-blocked-list");
const autofill = document.getElementById("autofill");

const meritWeight = document.getElementById("merit-weight");
const demeritWeight = document.getElementById("demerit-weight");
const maxPoint = document.getElementById("max-point");

const passwordToggle = document.getElementById("password-protection-toggle");
const passwordInput = document.getElementById("password");
const saveButton = document.getElementById("save");

maxPoint.placeholder = "60";

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
	extensionApi.storage.local.get("score", function(local) {
		extensionApi.action.setBadgeText({
			text: local.score.toString(10)
		});
	});
}

function block_settings(setting_enabled){
	if (setting_enabled){
		document.getElementById("blocked-list").disabled = true;
		document.getElementById("permanent-blocked-list").disabled = true;
		document.getElementById("merit-weight").disabled = true;
		document.getElementById("demerit-weight").disabled = true;
		document.getElementById("max-point").disabled = true;
		document.getElementById("password-protection-toggle").disabled = true;
		document.getElementById("password").disabled = true;
		document.getElementById("save").disabled = true;
	}
	else {
		document.getElementById("blocked-list").disabled = false;
		document.getElementById("permanent-blocked-list").disabled = false;
		document.getElementById("merit-weight").disabled = false;
		document.getElementById("demerit-weight").disabled = false;
		document.getElementById("max-point").disabled = false;
		document.getElementById("password-protection-toggle").disabled = false;
		document.getElementById("password").disabled = false;
		document.getElementById("save").disabled = false;
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
permanentblockedList.placeholder = [
	"youtube.com",
	"!https://www.youtube.com/watch?v=dQw4w9WgXcQ",
	"twitter.com",
	"facebook.com",
	"messenger.com",
	"discord.com",
	"instagram.com"
].join("\n");

blockedList.addEventListener("change", (event) => {
	const blocked_list = event.target.value.split("\n").map(s => s.trim()).filter(Boolean);
	extensionApi.storage.local.set({
		blocked_list
	});
});

permanentblockedList.addEventListener("change", (event) => {
	const permanent_blocked = event.target.value.split("\n").map(s => s.trim()).filter(Boolean);
	extensionApi.storage.local.set({
		permanent_blocked
	});
});

autofill.addEventListener("click", (event) => {
	const autofill_enabled = event.target.checked;

	extensionApi.storage.local.set({
		autofill_enabled
	});

	if(autofill_enabled){
		for(let i = 0; i < COMMON_DISTRACTORS.length; i++){
			blockedList.value += COMMON_DISTRACTORS[i] + "\n";
			const blocked_list = blockedList.value.split("\n").map(s => s.trim()).filter(Boolean);
			extensionApi.storage.local.set({
				blocked_list
			});
		}
	}
});

meritWeight.addEventListener("change", (event) => {
	const merit_weight = event.target.value;

	extensionApi.storage.local.set({
		merit_weight
	});
});

demeritWeight.addEventListener("change", (event) => {
	const demerit_weight = event.target.value;

	extensionApi.storage.local.set({
		demerit_weight
	});
});

maxPoint.addEventListener("change", (event) => {
	const max_point = event.target.value;

	extensionApi.storage.local.set({
		max_point
	});
});

passwordToggle.addEventListener("click", (event) => {
	const password_toggle = event.target.checked;
	if (!password_toggle){
		document.getElementById("password").disabled = true;
		document.getElementById("save").disabled = true;
		extensionApi.storage.local.set({
			password: ""});
	}
	else {
		document.getElementById("password").disabled = false;
		document.getElementById("save").disabled = false;
	}

	extensionApi.storage.local.set({
		password_toggle
	});
});

saveButton.addEventListener("click", (event) => {
	const password_input = passwordInput.value;
	extensionApi.storage.local.set({
		password: password_input
	});
	passwordInput.value = "";
});

window.addEventListener("DOMContentLoaded", () => {
	extensionApi.storage.local.get(["blocked_list", "setting_enabled", "permanent_blocked", "autofill_enabled", "merit_weight", "demerit_weight", "max_point", "password_toggle"], function(local) {
		const {
			blocked_list,
			setting_enabled,
			permanent_blocked,
			autofill_enabled,
			merit_weight,
			demerit_weight,
			max_point,
			password_toggle
		} = local;

		if (!Array.isArray(blocked_list)) {
			return;
		}

		// blocked
		var value = blocked_list.join("\r\n"); // display every blocked in new line
		blockedList.value = value;

		if (Array.isArray(permanent_blocked)) {
			// permanent blocked
			var permanentblocked_list = permanent_blocked.join("\r\n"); // display every permanent blocked in new line
			permanentblockedList.value = permanentblocked_list;
		}

		// settingEnabled
		block_settings(setting_enabled);

		// autofill
		autofill.checked = autofill_enabled;

		// meritWeight
		if(merit_weight == null || merit_weight == ""){
			extensionApi.storage.local.set({
				merit_weight: meritWeight.value
			});
		}
		else {
			meritWeight.value = merit_weight;
		}

		// demeritWeight
		if(demerit_weight == null || demerit_weight == ""){
			extensionApi.storage.local.set({
				demerit_weight: demeritWeight.value
			});
		}
		else {
			demeritWeight.value = demerit_weight;
		}

		// maxPoint
		maxPoint.value = max_point;

		// passwordToggle
		passwordToggle.checked = password_toggle;
		if (!password_toggle){
			document.getElementById("password").disabled = true;
			document.getElementById("save").disabled = true;
			extensionApi.storage.local.set({
				password: ""});
		}

		// UI ready
		document.body.classList.add("ready");
	});
});
