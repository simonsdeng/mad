var container,
    slider,
    auth,
    userdata,
    data;

var achievements = {
	starapp: {id: 1, description: "Reaching 100 points from asking questions and submitting answers/tips.", value: 100},
	stargame: {id: 2, description: "Getting a highscore of 20 in the game.", value: 20},
	question: {id: 3, description: "First time asking a question.", value: 1},
	tip: {id: 4, description: "First time submitting a tip.", value: 1},
	answer: {id: 5, description: "First time submitting an answer to a question.", value: 1},
	comment: {id: 6, description: "First time commenting on a tip.", value: 1},
	social: {id: 7, description: "First time sharing an achievement on social media.", value: 1}
	game: {id: 8, description: "First time playing \"Learnin' the Ropes.\"", value: 1}
	checkin: {id: 9, description: "First time checking in.", value: 1}
};

var menuOpen = false;

// navigates to new page
function go(url, data, replace) {
	window.data = data;
	slider.go(url, data, replace);
}

// navigates back to previous page
function back() {
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
	if (saved && localStorage.pendingAchievements) updatePendingAchievements();
	
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

// send pending achievements to server
function updatePendingAchievements() {
	post("achievements.php", {achievements: JSON.parse(localStorage.pendingAchievements)}, function() {
		delete localStorage.pendingAchievements;
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
	var achievements = {};
	achievements[id] = progress;
	userdata.achievements[id] = progress;
	localStorage.userdata = JSON.stringify(userdata);
	
	post("achievements.php", {achievements: achievements}, null, function () {
		var pending = {};
		if (localStorage.pendingAchievements) {
			pending = JSON.parse(localStorage.pendingAchievements);
		}
		
		pending[id] = progress;
		
		localStorage.pendingAchievements = JSON.stringify(pending);
	});
}

$(document).on("deviceready", init);
