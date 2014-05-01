function PageSlider(container) {

	var currentPage,
	    stateHistory = [],
	    sliding = false;

	this.state = null;

	// slides to next page
	this.go = function (url, data, replace) {
		var state = {url: url, data: data};

		if (replace) stateHistory.pop();
		stateHistory.push(state);
		this.state = state;
		this.slidePage(url, stateHistory.length > 1 ? "right" : false);
	};

	// slides back to previous page
	this.back = function () {
		if (stateHistory.length <= 1) {
			navigator.app.exitApp();
			return;
		}
		
		stateHistory.pop();
		this.state = stateHistory[stateHistory.length - 1];
		this.slidePage(this.state.url, "left");

		return this.state.data;
	};

	// slides page in from left or right
	this.slidePage = function (url, from) {
		if (sliding) return false;
		
		sliding = true;
		
		$.get(url, function (d) {
			var page = document.createElement("div");
			page.innerHTML = d;
			page = $(page);

			container.append(page);

			if (!currentPage || !from) {
				page.attr("class", "page center");
				currentPage = page;
				sliding = false;
				return;
			}

			// Position the page at the starting position of the animation
			page.attr("class", "page " + from);

			currentPage.one('webkitTransitionEnd', function(e) {
				$(e.target).remove();
				sliding = false;
			});

			// Force reflow. More information here: http://www.phpied.com/rendering-repaint-reflowrelayout-restyle/
			container[0].offsetWidth;

			// Position the new page and the current page at the ending position of their animation with a transition class indicating the duration of the animation
			page.attr("class", "page transition center");
			currentPage.attr("class", "page transition " + (from === "left" ? "right" : "left"));
			currentPage = page;
		});
		
		return true;
	};

}
