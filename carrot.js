// Create the menus

// TODO: Create the menus according to the content user selected

var MenuEmail = chrome.contextMenus.create({
	"id":"menuemail",
	"title": "Email (by Carrot!)",
	"contexts":['all']
	});

var MenuBuild = chrome.contextMenus.create({
	"id":"menubuild",
	"title": "Build's checkin list",
	"contexts":['selection']
	});

var MenuRally = chrome.contextMenus.create({
	"id":"menurally",
	"title": "Open DE/US page",
	"contexts":['selection']
	});

var MenuTQMS = chrome.contextMenus.create({
	"id":"menutqms",
	"title": "Open TQMS page",
	"contexts":['selection']
	});

chrome.contextMenus.onClicked.addListener(onMenuClickHandler);

// The onClicked callback function.
function onMenuClickHandler(info, tab){
	if(info.menuItemId=='menuemail'){
		var action_url = "mailto:?";
		action_url += "subject=" + encodeURIComponent(tab.title) + "&";
		action_url += "body=" + encodeURIComponent(tab.url);
		if(info.selectionText)
			action_url += encodeURIComponent("\n\n") + info.selectionText;
		console.log('Action url: ' + action_url);
		chrome.tabs.update(tab.id, { url: action_url });
	}
	else
	{
		var action_url = "";
		if(info.menuItemId=='menubuild'){
			//TODO: check whether info.selectionText is a build number
			action_url = "http://tech-websrvr/build/Builds/"+encodeURIComponent(info.selectionText)+"/AutomatedAcceptance/Comments.txt";
		}
		else if(info.menuItemId=='menutqms'){
			//TODO: check whether info.selectionText is a TQMS id
			action_url = "https://tech-websrvr.labs.microstrategy.com/Technology/TQMSWeb/viewissue/viewissuewindow.aspx?id="+encodeURIComponent(info.selectionText);
		}
		else if(info.menuItemId=='menurally'){
			//Begins with DE or US or F?
			action_url = "https://rally1.rallydev.com/#/40120756498/search?keywords="+encodeURIComponent(info.selectionText);
		}
		else
			action_url = "";


		if(action_url)
		{
			window.open(action_url, '_blank');	//Open the trarget in new blank window
			console.log('Action url: ' + action_url);
		}
		else
		{
			console.log(info.menuItemId);
			console.log(tab.url);
			console.log(tab.title);
			var sText = info.selectionText;
			var url = "https://www.google.com/search?q=" + encodeURIComponent(sText);
			//window.open(url, '_blank');
		}
	}

};


//-------Another solution to send email, created by Google-------
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function customMailtoUrl() {
	if (window.localStorage == null)
		return "";
	if (window.localStorage.customMailtoUrl == null)
		return "";
	return window.localStorage.customMailtoUrl;
}

function executeMailto(tab_id, subject, body, selection) {
	var default_handler = customMailtoUrl().length == 0;

	var action_url = "mailto:?"
	if (subject.length > 0)
		action_url += "subject=" + encodeURIComponent(subject) + "&";

	if (body.length > 0) {
		action_url += "body=" + encodeURIComponent(body);
		// Append the current selection to the end of the text message.
		if (selection.length > 0) {
			action_url += encodeURIComponent("\n\n") +
			encodeURIComponent(selection);
		}
	}

	if (!default_handler) {
		// Custom URL's (such as opening mailto in Gmail tab) should have a
		// separate tab to avoid clobbering the page you are on.
		var custom_url = customMailtoUrl();
		action_url = custom_url.replace("%s", encodeURIComponent(action_url));
		console.log('Custom url: ' + action_url);
		chrome.tabs.create({ url: action_url });
	} else {
		// Plain vanilla mailto links open up in the same tab to prevent
		// blank tabs being left behind.
		console.log('Action url: ' + action_url);
		chrome.tabs.update(tab_id, { url: action_url });
	}
}

chrome.runtime.onConnect.addListener(function(port) {
	var tab = port.sender.tab;
	// This will get called by the content script we execute in
	// the tab as a result of the user pressing the browser action.
	port.onMessage.addListener(function(info) {
	var max_length = 1024;
	if (info.selection.length > max_length)
		info.selection = info.selection.substring(0, max_length);
	executeMailto(tab.id, info.title, tab.url, info.selection);
	});
});

// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {
	// We can only inject scripts to find the title on pages loaded with http
	// and https,so for all other pages, we don't ask for the title.
	if (tab.url.indexOf("http:") != 0 &&
	tab.url.indexOf("https:") != 0) {
		executeMailto(tab.id, "", tab.url, "");
	}
	else {
		chrome.tabs.executeScript(null, {file: "content_script.js"});
	}
});

// Google's solution to send email
//-------END-------
