var container,
	slider;

// navigates to page
function go(url, data) {
	history.pushState({url: url, data: data});
	route();
}

// handles history state changes through AJAX
function route() {
	var url = (history.state) ? history.state.url : "main.html";
	
	$.get(url, function (data) {
		slider.slidePage($(data));
	});
}

// check for saved credentials
function isLoggedIn() {
	return false;
}

// log in user and start main app
function login() {
	if (isLoggedIn()) {
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
