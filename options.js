"use strict";

/* global chrome, window, document */

const blockedList = document.getElementById("blocked-list");
const resolutionSelect = document.getElementById("resolution-select");
const enabledToggle = document.getElementById("enabled-toggle");

const meritWeight = document.getElementById("merit-weight");
const demeritWeight = document.getElementById("demerit-weight");
const maxPoint = document.getElementById("max-point");
const resetAfterClousureToggle = document.getElementById("reset-after-clousure-toggle");

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

resetAfterClousureToggle.addEventListener("change", (event) => {
	const reset_after_clousure = event.target.checked;

	chrome.storage.local.set({
		reset_after_clousure
	});
});

window.addEventListener("DOMContentLoaded", () => {
	chrome.storage.local.get(["enabled", "blocked", "resolution", "merit_weight", "demerit_weight", "max_point", "reset_after_clousure"], function(local) {
		const {
			enabled,
			blocked,
			resolution,
			merit_weight,
			demerit_weight,
			max_point,
			reset_after_clousure
		} = local;

		if (!Array.isArray(blocked)) {
			return;
		}

		// blocked
		var value = blocked.join("\r\n"); // display every blocked in new line
		blockedList.value = value;

		// resolution
		resolutionSelect.value = resolution;

		// enabled
		enabledToggle.checked = enabled;

		// meritWeight
		meritWeight.value = merit_weight;

		// demeritWeight
		demeritWeight.value = demerit_weight;

		// maxPoint
		maxPoint.value = max_point;

		// resetAfterClousureToggle
		resetAfterClousureToggle.checked = reset_after_clousure;

		// UI ready
		document.body.classList.add("ready");
	});
});