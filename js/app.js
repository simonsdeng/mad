var container,
	slider;
	
var menuOpen = 0;

// navigates to page
function go(url, data) {
	history.pushState({url: url, data: data});
	route();
}

// handles history state changes through AJAX
function route() {
	var url = (history.state) ? history.state.url : "discussion.html";
	
	$.get(url, function (data) {
		slider.slidePage($(data));
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
