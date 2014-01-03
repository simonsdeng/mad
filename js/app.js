var container;

// load content through AJAX
function load(url, callback) {
	var xhr = new XMLHttpRequest();
	
	xhr.onreadystatechange = function () {
		callback(this.responseText);
	}
	
	xhr.open("get", url, true);
	xhr.send();
}

// update page content
function show(content) {
	container.innerHTML = content;
}

// init on phonegap ready
function init() {
	FastClick.attach(document.body);
	container = document.getElementById("container");
	
	load("main.html", show);
}

document.addEventListener("deviceready", init, false);
