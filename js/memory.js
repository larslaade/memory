// Memory

// (c) 2010-2013 Lars Laade
// MIT license

var Memory = function(list_element) {
	var that = this;
	this.list = list_element;
	this.page = $('.page');
	this.items = this.list.find('.card');
	this.items_length = this.items.length;
	this.current_flipped_1 = null;
	this.current_flipped_2 = null;
	this.match = 0;
	this.rounds = 0;
	this.win = $(window);

	this.list.on('click', 'li', function() {
		that.flipCard($(this));
	}).on('mousedown', 'li', function(event) {
		event.preventDefault();
		event.stopPropagation();
	});
	this.sort();
	this.resize();
	this.win.on('resize', function() {
		that.resize();
	});
};

Memory.prototype.resize = function() {
	this.win.height();
	this.list.width(this.win.height());
};

Memory.prototype.flipCard = function(card) {
	var that = this;
	if (card.hasClass('flipped') === false) {
		if (!this.current_flipped_1) {
			card.toggleClass('flipped');
			this.current_flipped_1 = card;
		} else if (!this.current_flipped_2) {
			card.toggleClass('flipped');
			this.current_flipped_2 = card;
			setTimeout(function() {
				that.check();
			}, 1000);
		}
	}
};

Memory.prototype.check = function() {
	var that = this,
		div;
	this.rounds++;
	// not the same
	if (this.current_flipped_1.find('.front').attr('src') !== this.current_flipped_2.find('.front').attr('src')) {
		this.current_flipped_1.addClass('fail');
		this.current_flipped_2.addClass('fail');
		setTimeout(function() {
			that.fail();
		}, 1000);
	} else { // the same
		this.current_flipped_1.addClass('win');
		this.current_flipped_2.addClass('win');
		this.current_flipped_1 = null;
		this.current_flipped_2 = null;
		this.match += 2;
		// check if all cards are flipped
		if (this.match === this.items_length) {
			this.list.addClass('rotate');
			div = $('<p class="overlay"></p>').html('Required clicks: <strong>' + this.rounds + '</strong>.<br/>Try again!').css({
				'top': this.page.height() / 2 - 150,
				'left': this.page.width() / 2 - 150
			}).on('click', function() {
				that.retry(div);
			});
			this.list.parent().append(div);
			setTimeout(function() {
				that.list.removeClass('rotate');
			}, 2000);
		}
	}
};

Memory.prototype.retry = function(element) {
	var that = this,
		i = 0,
		item;
	element.unbind('click').remove();
	this.list.removeClass('rotate');
	this.items.removeClass('win flipped');
	setTimeout(function() {
		that.sort();
	}, 1000);
};

Memory.prototype.fail = function() {
	this.current_flipped_1.removeClass('fail').toggleClass('flipped');
	this.current_flipped_2.removeClass('fail').toggleClass('flipped');
	this.current_flipped_1 = null;
	this.current_flipped_2 = null;
};

Memory.prototype.sort = function() {
	var done = new Array(),
		sorted = false,
		n = null,
		l = this.items_length;
	this.list.empty();
	this.rounds = 0;
	this.match = 0;
	do {
		n = Math.floor(Math.random() * (l + 1));
		if ($.inArray(n, done) === -1) {
			done[done.length] = n;
			this.list.append(this.items[n]);
		}
	} while (done.length <= l);
};

var mem = new Memory($('#card_list'));