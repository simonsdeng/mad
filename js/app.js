var container,
	slider;
	
var menuOpen = 0;

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

// init on phonegap ready
function init() {
	FastClick.attach(document.body);
	container = $("#container");
	
	slider = new PageSlider(container);
	$(window).on("popstate", route);
	route();
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
