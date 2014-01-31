var container,
	slider,
	auth,
	userdata;

var mainUrl = History.getState().url,
	routing = false,
	forward = false;

var menuOpen = 0;

// navigates to page
function go(url, data, replace) {
	if (routing) {
		return;
	}
	
	forward = true;
	if (replace) {
		History.replaceState(data, null, url);
	} else {
		History.pushState(data, null, url);
	}
}

// requests JSON data through AJAX or falls back to cache
function get(url, data, success, failure) {
	if (navigator.connection.type !== Connection.NONE) {
		$.get("http://hhsfbla.com/mad2013/" + url, data, function (d) {
			localStorage[url + "?" + data] = d;
			success(JSON.parse(d));
		}, "text");
	} else {
		var d = localStorage[url + "?" + data];
		if (d === undefined) {
			success(JSON.parse(d));
		} else if (failure) {
			failure();
		}
	}
}

// posts data through AJAX with authentication
function post(url, data, success, failure) {
	if (navigator.connection.type !== Connection.NONE) {
		data.auth = auth;
		$.post("http://hhsfbla.com/mad2013/" + url, data, function (d) {
			if (success) {
				success(d);
			}
		}, "json");
	} else if (failure) {
		failure();
	}
}

// handles history state changes through AJAX
function route() {
	routing = true;
	
	console.log(History.getCurrentIndex());
	var url = History.getState().url;
	if (url === mainUrl) {
		url = "main.html";
	}
	
	$.get(url, function (data) {
		if (forward) {
			slider.slidePageFrom($("<div>").html(data), "right");
			forward = false;
		} else {
			slider.slidePageFrom($("<div>").html(data), "left");
		}
	});
}

// check for saved credentials
function isLoggedIn() {
	return !!localStorage.auth;
}

// log in user and start main app
function login() {
	if (isLoggedIn()) {
		initGlobals();
		main();
	} else {
		container.load("login.html");
	}
}

// start main app interface
function main() {
	container.empty();
	slider = new PageSlider(container);
	$(window).on("popstate", route);
	route();
}

// init globals
function initGlobals() {
	auth = JSON.parse(localStorage.auth);
	userdata = JSON.parse(localStorage.userdata);
}

// init on phonegap ready
function init() {
	FastClick.attach(document.body);
	container = $("#container");
	
	login();
}

function toggleMenu() {

	if(menuOpen==0) {
		document.getElementById("drawer-menu").className = "menu-visible";
		menuOpen = 1;
	}
	else {
		document.getElementById("drawer-menu").className = "menu-hidden";
		menuOpen = 0;
	}
}

$(document).on("deviceready", init);
