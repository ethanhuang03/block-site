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

const resolutionSelect = document.getElementById("resolution-select");

const buttonImage = document.getElementById("button-image");
const enabledButton = document.getElementById("enable-button");
const settingsButton = document.getElementById("settings-button");
const enabledStatus = document.getElementById("status");

const meritWeight = document.getElementById("merit-weight");
const demeritWeight = document.getElementById("demerit-weight");
const maxPoint = document.getElementById("max-point");
const resetAfterClosureToggle = document.getElementById("reset-after-closure-toggle");
const settingEnabled = document.getElementById("setting-enabled");


function updateBadge(){
	extensionApi.storage.local.get("score", function(local) {
		extensionApi.action.setBadgeText({
			text: local.score.toString(10)
		});
	});
}

function block_settings(setting_enabled){
	if (setting_enabled){
		document.getElementById("enable-button").disabled = true;
		document.getElementById("merit-weight").disabled = true;
		document.getElementById("demerit-weight").disabled = true;
		document.getElementById("max-point").disabled = true;
	}
	else {
		document.getElementById("enable-button").disabled = false;
		document.getElementById("merit-weight").disabled = false;
		document.getElementById("demerit-weight").disabled = false;
		document.getElementById("max-point").disabled = false;
		updateBadge();
	}
}

maxPoint.placeholder = "60";

enabledButton.addEventListener("click", (event) => {
	if (buttonImage.src === extensionApi.runtime.getURL("images/green_unlocked.png")) {
		buttonImage.src = extensionApi.runtime.getURL("images/red_unlocked.png")
		extensionApi.storage.local.set({
			enabled: false
		});
		enabledStatus.innerText = "Disabled";
	}
	else {
		buttonImage.src = extensionApi.runtime.getURL("images/green_unlocked.png")
		extensionApi.storage.local.set({
			enabled: true
		});
		enabledStatus.innerText = "Enabled";
	}
});

settingsButton.addEventListener("click", (event) => {
	extensionApi.tabs.create({
		url: extensionApi.runtime.getURL("src/ui/settings.html")
	});
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

resetAfterClosureToggle.addEventListener("change", (event) => {
	const reset_after_closure = event.target.checked;

	extensionApi.storage.local.set({
		reset_after_closure
	});
});

resolutionSelect.addEventListener("change", (event) => {
	const resolution = event.target.value;

	extensionApi.storage.local.set({
		resolution
	});
});


settingEnabled.addEventListener("click", (event) => {
	const setting_enabled = event.target.checked;

	extensionApi.storage.local.get("enabled", function(local) {
		if (local.enabled) {
			if (setting_enabled) {
				buttonImage.src = extensionApi.runtime.getURL("images/green_locked.png");
				enabledStatus.innerText = "Settings Locked";
			}
			else {
				buttonImage.src = extensionApi.runtime.getURL("images/green_unlocked.png");
				enabledStatus.innerText = "Enabled";
			}
		}
		else {
			if (setting_enabled) {
				buttonImage.src = extensionApi.runtime.getURL("images/red_locked.png");
				enabledStatus.innerText = "Settings Locked";
			}
			else {
				buttonImage.src = extensionApi.runtime.getURL("images/red_unlocked.png");
				enabledStatus.innerText = "Disabled";
			}
		}
	});

	extensionApi.storage.local.set({
		setting_enabled
	});

	if(!setting_enabled){
		extensionApi.storage.local.set({
			score: 0
		});
	}

	block_settings(setting_enabled);
});

window.addEventListener("DOMContentLoaded", () => {
	extensionApi.storage.local.get(["enabled", "blocked_list", "resolution", "merit_weight", "demerit_weight", "max_point", "reset_after_closure", "setting_enabled", "permanent_blocked", "block_adult", "autofill_enabled"], function(local) {
		const {
			enabled,
			resolution,
			merit_weight,
			demerit_weight,
			max_point,
			reset_after_closure,
			setting_enabled
		} = local;

		// resolution
		resolutionSelect.value = resolution;

		// enabled
		if(enabled){
			if (setting_enabled) {
				buttonImage.src = extensionApi.runtime.getURL("images/green_locked.png")
				enabledStatus.innerText = "Settings Locked";
			}
			else {
				buttonImage.src = extensionApi.runtime.getURL("images/green_unlocked.png")
				enabledStatus.innerText = "Enabled";
			}
		}
		else {
			if (setting_enabled) {
				buttonImage.src = extensionApi.runtime.getURL("images/red_locked.png")
				enabledStatus.innerText = "Settings Locked";
			}
			else {
				buttonImage.src = extensionApi.runtime.getURL("images/red_unlocked.png")
				enabledStatus.innerText = "Disabled";
			}
		}

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

		// resetAfterClosureToggle
		resetAfterClosureToggle.checked = reset_after_closure;

		// settingEnabled
		settingEnabled.checked = setting_enabled;
		block_settings(setting_enabled);

		// UI ready
		document.body.classList.add("ready");
	});
});
