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
	}
	else {
		document.getElementById("enable-button").disabled = false;
		updateBadge();
	}
}


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
				/*
				Add password protection
				Overlay an html page propmting for password
				if correct, it removes overlay and allow setting_enabled to true
				if wrong, it removes overlay and reverts setting_enabled to false
				*/
				
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
				/*
				Add password protection
				Overlay an html page propmting for password
				if correct, it removes overlay and allow setting_enabled to true
				if wrong, it removes overlay and reverts setting_enabled to false
				*/

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
	extensionApi.storage.local.get(["enabled", "resolution", "reset_after_closure", "setting_enabled", "permanent_blocked", "block_adult", "autofill_enabled"], function(local) {
		const {
			enabled,
			resolution,
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

		// resetAfterClosureToggle
		resetAfterClosureToggle.checked = reset_after_closure;

		// settingEnabled
		settingEnabled.checked = setting_enabled;
		block_settings(setting_enabled);

		// UI ready
		document.body.classList.add("ready");
	});
});
