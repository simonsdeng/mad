var container,
	slider;

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

// requests data through AJAX or falls back to cache
function get(url, data, success, failure) {
	if (navigator.connection.type !== Connection.NONE) {
		$.get(url, data, function (d) {
			localStorage[url + "?" + data] = d;
			success(d);
		});
	} else {
		var d = localStorage[url + "?" + data];
		if (d === undefined) {
			success(d);
		} else if (failure) {
			failure();
		}
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

// init on phonegap ready
function init() {
	FastClick.attach(document.body);
	container = $("#container");
	
	slider = new PageSlider(container);
	$(window).on("popstate", route);
	route();
}

$(document).on("deviceready", init);
