// Memory

// (c) 2010-2014 Lars Laade
// MIT license

(function() {

	var list = document.getElementById('card_list');

	var page = document.getElementsByClassName('page')[0];
	var items = document.getElementsByClassName('card');

	var cards = [];
	var map = [];

	var itemsCount = items.length;
	var currentFlippedOne = null;
	var currentFlippedTwo = null;
	var match = 0;
	var rounds = 0;

	var has3d = Modernizr.csstransforms3d;
	var hasTouch = Modernizr.touch;

	var setupMap = function() {
		var front,
			back,
			inner,
			i;

		cards = [];
		map = [];

		for (i = 0; i < itemsCount; i++) {
			front = items[i].getElementsByClassName('front')[0];
			back = items[i].getElementsByClassName('back')[0];
			inner = items[i].getElementsByClassName('inner')[0];

			front.parentNode.removeChild(front);

			cards.push({
				front: front,
				back: back,
				inner: inner
			});

			map.push(i);
		}
	};

	var resizeHandler = function() {
		var height = document.body.scrollHeight,
			width = document.body.scrollWidth,
			newWidth = height;

		if (newWidth > width) {
			newWidth = width;
		}

		list.style.width = newWidth + 'px';
		list.style.height = newWidth + 'px';
	};

	var flipCard = function(card) {

		if (card.classList.contains('flipped')) {
			return;
		}

		var index = Array.prototype.indexOf.call(items, card);
		var indexMap = map.indexOf(index);

		var set = cards[map[indexMap]];

		set.inner.insertBefore(set.front, set.back);

		if (!currentFlippedOne) {
			card.classList.toggle('flipped');
			currentFlippedOne = card;
		} else if (!currentFlippedTwo) {
			card.classList.toggle('flipped');
			currentFlippedTwo = card;

			setTimeout(function() {
				check();
			}, (has3d ? 1000 : 100));
		}
	};

	var retryHandler;

	var check = function() {
		var div;

		rounds++;

		// not the same
		if (currentFlippedOne.getElementsByClassName('front')[0].title !== currentFlippedTwo.getElementsByClassName('front')[0].title) {
			currentFlippedOne.classList.add('fail');
			currentFlippedTwo.classList.add('fail');

			setTimeout(function() {
				fail();
			}, 1000);
		} else { // the same
			currentFlippedOne.classList.add('win');
			currentFlippedTwo.classList.add('win');
			currentFlippedOne = null;
			currentFlippedTwo = null;
			match += 2;

			// check if all cards are flipped
			if (match === itemsCount) {
				list.classList.add('rotate');

				div = document.createElement('div');
				div.classList.add('overlay');
				div.innerHTML = 'Comparisons: <strong>' + rounds + '</strong>.<br/>Try again!';
				div.style.top = '50%';
				div.style.left = '50%';
				div.style.marginTop = -150 + 'px';
				div.style.marginLeft = -150 + 'px';

				retryHandler = function() {
					retry(div);
				};
				div.addEventListener('click', retryHandler);

				list.parentElement.appendChild(div);

				setTimeout(function() {
					list.classList.remove('rotate');
				}, 2000);
			}
		}
	};

	var retry = function(element) {

		var i = itemsCount - 1,
			item;

		element.removeEventListener('click', retryHandler);
		element.parentNode.removeChild(element);

		list.classList.remove('rotate');

		do {
			item = items[i];
			item.classList.remove('win');
			item.classList.remove('flipped');
			i--;
		} while (i > -1)

		setTimeout(function() {
			sort();
		}, 1000);
	};

	var fail = function() {
		currentFlippedOne.classList.remove('fail');
		currentFlippedOne.classList.toggle('flipped');
		resetCard(currentFlippedOne);

		currentFlippedTwo.classList.remove('fail');
		currentFlippedTwo.classList.toggle('flipped');
		resetCard(currentFlippedTwo);

		currentFlippedOne = null;
		currentFlippedTwo = null;
	};

	// removes the front of a card
	var resetCard = function(card) {
		var index = Array.prototype.indexOf.call(items, card);
		var indexMap = map.indexOf(index);
		var set = cards[map[indexMap]];

		set.front = set.inner.removeChild(set.front);
		cards[map[indexMap]] = set;
	};

	// sort current set
	var sort = function() {
		var item,
			done = [],
			sorted = false,
			n = null,
			l = itemsCount;

		rounds = 0;
		match = 0;

		do {
			n = Math.floor(Math.random() * (l + 1));

			if (done.indexOf(n) === -1) {
				item = items[n];

				if (item) {
					item.parentNode.removeChild(item);
					list.appendChild(item);
				}

				done.push(n);
			}
		} while (done.length <= l);

		setupMap();
	};

	sort();
	resizeHandler();
	window.addEventListener('resize', resizeHandler);

	// helper
	var getParent = function(element, search) {
		var p = element.parentElement;

		if (!p || !p.nodeName) {
			return null;
		}

		if (p.nodeName.toLowerCase() === search) {
			return p;
		} else {
			return getParent(p, search);
		}
	};

	// clicking a card
	list.addEventListener((hasTouch) ? 'touchstart' : 'click', function(event) {
		var element = event.target,
			nodeName = element.nodeName.toLowerCase();

		if (nodeName !== 'li') {
			element = getParent(element, 'li');
			nodeName = element.nodeName.toLowerCase();
		}

		if (nodeName === 'li') {
			event.preventDefault();
			event.stopPropagation();
			flipCard(element);
		}
	});

	// prevent dragging
	list.addEventListener('mousedown', function(event) {
		var element = event.target,
			nodeName = element.nodeName.toLowerCase();

		if (nodeName !== 'li') {
			element = getParent(element, 'li');
			nodeName = element.nodeName.toLowerCase();
		}

		if (nodeName === 'li') {
			event.preventDefault();
			event.stopPropagation();
		}
	});
})();
