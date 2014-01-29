var container,
	slider,
	auth;

// navigates to page
function go(url, data, replace) {
	var state = {url: url, data: data};
	
	if (replace) {
		history.replaceState(state);
	} else {
		history.pushState(state);
	}
	
	route();
}

// requests JSON data through AJAX or falls back to cache
function get(url, data, success, failure) {
	if (navigator.connection.type !== Connection.NONE) {
		$.get("http://hhsfbla.com/mad2013/" + url, data, function (d) {
			localStorage[url + "?" + data] = d;
			success(d);
		}, "json");
	} else {
		var d = localStorage[url + "?" + data];
		if (d === undefined) {
			success(d);
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
function route(back) {
	var url = (history.state) ? history.state.url : "main.html";
	
	$.get(url, function (data) {
		if (back) {
			slider.slidePageFrom($("<div>").html(data), "left");
		} else {
			slider.slidePageFrom($("<div>").html(data), "right");
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
		auth = JSON.parse(localStorage.auth);
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

// init on phonegap ready
function init() {
	FastClick.attach(document.body);
	container = $("#container");
	
	login();
}

$(document).on("deviceready", init);
