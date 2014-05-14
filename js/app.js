var container,
    slider,
    auth,
    userdata,
    data;

var menuOpen = false;

// navigates to new page
function go(url, data, replace) {
	window.data = data;
	slider.go(url, data, replace);
}

// navigates back to previous page
function back() {
	// save game highscore if leaving game page
	if (slider.state.url == "game.html") {
		if (points && (!userdata.highscore || userdata.highscore < points)) {
			updateUserdata({highscore: points});
		}
	}
	
	data = slider.back();
}

// processes drawer menu item click
function menuGo(url) {
	toggleMenu();
	
	if (url === slider.state.url) return;
	
	if (url === "main.html") {
		back();
	} else {
		go(url, null, slider.state.url !== "main.html");
	}
}

// loads JSON data first from cache, then through AJAX
// (success callback may be called twice)
function get(url, data, success, failure) {
	var key = url + (data !== null ? "?" + $.param(data) : "");
	var d = localStorage[key];
	if (d !== undefined) success(JSON.parse(d));
	
	if (navigator.connection.type !== Connection.NONE) {
		$.get("http://hhsfbla.com/mad2013/" + url, data, function (d) {
			localStorage[key] = d;
			success(JSON.parse(d));
		}, "text");
	} else if (d === undefined && failure) failure();
}

// posts data through AJAX with authentication
function post(url, data, success, failure) {
	if (navigator.connection.type !== Connection.NONE) {
		if (!data) data = {};
		data.auth = auth;
		$.post("http://hhsfbla.com/mad2013/" + url, data, function (d) {
			if (success) success(d);
		}, "json");
	} else if (failure) failure();
}

// applies userdata updates and sends them to the server
// (don't write to userdata directly)
function updateUserdata(data) {
	$.extend(userdata, data);
	localStorage.userdata = JSON.stringify(userdata);
	
	post("userdata.php", {update: JSON.stringify(data)}, null, function () {
		var pending = {};
		if (localStorage.pending) pending = JSON.parse(localStorage.pending);
		
		$.extend(pending, data);
		localStorage.pending = JSON.stringify(pending);
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

// log out user and return to login/register page
function logout() {
	slider.clearHistory();
	delete localStorage.auth;
	login();
}

// start main app interface
function main() {
	container.empty();
	slider = new PageSlider(container);
	go("main.html");
}

// initialize logged in user
function initUser(saved) {
	if (saved && localStorage.pending) updatePending();
	
	post("login.php", null, function (d) {
		if (d.status === "success") {
			if (!saved) localStorage.auth = JSON.stringify(auth);
			userdata = d.userdata;
			localStorage.userdata = JSON.stringify(userdata);
			main();
		} else if (saved) {
			delete localStorage.auth;
			delete localStorage.userdata;
			delete localStorage.pendingAchievements;
			login();
		} else {
			navigator.notification.alert("Your username and password combination was incorrect.", null, "Login", "OK");
		}
	}, function () {
		if (saved) {
			userdata = JSON.parse(localStorage.userdata);
			main();
		} else {
			navigator.notification.alert("You need to be connected to the internet to log in.", null, "Login", "OK");
		}
	});
}

// update userdata on server
function updatePending() {
	post("userdata.php", {update: JSON.parse(localStorage.pending)}, function() {
		delete localStorage.pending;
	});
}

// init on phonegap ready
function init() {
	FastClick.attach(document.body);
	document.addEventListener("backbutton", onBack, false);
	$("#menu-container").load("menu.html");
	container = $("#container");
	
	login();
}

// back button callback
function onBack() {
	if (menuOpen) {
		toggleMenu();
	} else {
		back();
	}
}

// toggle drawer menu
function toggleMenu() {
	if (menuOpen) {
		$("#menu-container").removeClass("menu-visible");
	} else {
		$("#menu-container").addClass("menu-visible");
	}
	
	menuOpen = !menuOpen;
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

// share achievement
function share() {
	window.plugins.socialsharing.share('I just got an achievement on IT Academy: '
			+ document.getElementById('achievement-name').firstChild.firstChild.innerHTML);
}

// dismiss achievement popups
function dismissAchievements() {
	var arr = document.getElementsByClassName('achievement-div');
	for (var i = 0; i < arr.length; i++) {
		arr[i].style.display = "none";
	}
}

function toggleLike(button, data, isResponse) {
	var type = isResponse ? 1 : 0;
	button = $(button);
	var likeText = button.find(".like-text");
	var numLikes = button.find(".num-likes");
	
	if (data.liked) {
		post("discussion.php", {unlike: type, id: data.id}, function () {
			data.likes--;
			data.liked = 0;
			button.removeClass("liked");
			likeText.text("like");
			numLikes.text(data.likes);
		}, function () {
			navigator.nofication.alert("You must be online to unlike this post.", null, "Post");
		});
	} else {
		post("discussion.php", {like: type, id: data.id}, function () {
			data.likes++;
			data.liked = 1;
			button.addClass("liked");
			likeText.text("unlike");
			numLikes.text(data.likes);
		}, function () {
			navigator.nofication.alert("You must be online to like this post.", null, "Post");
		});
	}
}

function setAchievement(id, progress) {
	var achievement = {};
	achievement[id] = progress;
	
	updateUserdata({achievements: achievement});
}

$(document).on("deviceready", init);
