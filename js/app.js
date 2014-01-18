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

// init on phonegap ready
function init() {
	FastClick.attach(document.body);
	container = $("#container");
	
	slider = new PageSlider(container);
	$(window).on("popstate", route);
	route();
}

$(document).on("deviceready", init);
