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

const passwordInput = document.getElementById("password-input");
const unlockButton = document.getElementById("unlock-button");

extensionApi.storage.local.set({
  setting_enabled: true
});

unlockButton.addEventListener("click", (event) => {
  extensionApi.storage.local.get("password", function(local) {

    if (passwordInput.value == local.password) {
      console.log("Password Correct");
      
      extensionApi.storage.local.set({
        setting_enabled: false
      });
      
    }
    else {
      console.log("Password Incorrect");
      
      extensionApi.storage.local.set({
        setting_enabled: true
      });
      
    }
  });
  window.location.href="popup.html";
});