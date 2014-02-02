var container,
	slider,
	auth,
	userdata,
	data;

var mainUrl = History.getState().url,
	routing = false,
	forward = false;

var menuOpen = 0;
function share(){
	window.plugins.socialsharing.share('I just got an achievement on IT Academy: '+document.getElementById('achievement-name').firstChild.firstChild.innerHTML);
}
function dismiss_achievements(){
	var arr = document.getElementsByClassName('achievement-div');
	for(var i=0;i<arr.length;i++){
		arr[i].style.display = "none";
	}
}
// navigates to page
function go(url, data, replace) {
	menuOpen = 0;
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

function getExpertise(id) {
	switch (id) {
	case 1:
		return "tutor";
	case 2:
		return "experienced";
	case 3:
		return "beginner";
	case 4:
		return "tutee";
	}
}

function getPostType(type) {
	switch (type) {
	case 1:
		return "question";
	case 2:
		return "answered";
	case 3:
		return "tip";
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
		if (d !== undefined) {
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
	
	var state = History.getState();
	var url = state.url;
	if (url === mainUrl) {
		url = "main.html";
	}
	data = state.data;
	
	$.get(url, function (data) {
		var page = document.createElement("div");
		page.innerHTML = data;
		
		if (forward) {
			slider.slidePageFrom($(page), "right");
			forward = false;
		} else {
			slider.slidePageFrom($(page), "left");
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
		initUser(true);
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

// initialize logged in user
function initUser(saved) {
	post("login.php", {}, function (d) {
		if (d.status === "success") {
			userdata = d.userdata;
			localStorage.auth = JSON.stringify(auth);
			localStorage.userdata = JSON.stringify(userdata);
			main();
		} else if (saved) {
			delete localStorage.auth;
			login();
		} else {
			navigator.notification.alert("Your username and password combination was incorrect.", null, "Login", "OK");
		}
	}, function () {
		navigator.notification.alert("You need to be connected to the internet to log in.", null, "Login", "OK");
	});
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
