// Memory

// (c) 2010-2020 Lars Laade
// MIT license

(function() {

	var list = document.getElementById('card_list');

	var page = document.querySelector('.page');
	var items = Array.prototype.slice.call(document.querySelectorAll('.card'), 0);

	var cards = [];
	var map = [];

	var itemsCount = items.length;
	var currentFlippedOne = null;
	var currentFlippedTwo = null;
	var match = 0;
	var rounds = 0;

	var has3d = Modernizr.csstransforms3d;
	var hasTouch = Modernizr.touch;

	var retryHandler;

	function setupMap() {
		cards = [];
		map = [];

		for (let i = 0; i < itemsCount; i++) {
			const front = items[i].querySelector('.front');
			const back = items[i].querySelector('.back');
			const inner = items[i].querySelector('.inner');

			cards.push({
				name: front.getAttribute('title'),
				front: front,
				back: back,
				inner: inner
			});

			front.setAttribute('title', '')
			front.children[0].setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '');

			map.push(i);
		}
	}

	function resizeHandler() {
		const height = window.innerHeight,
		const width = window.innerWidth,
		const newWidth = (height > width) ? width : height;

		list.style.width = newWidth + 'px';
		list.style.height = newWidth + 'px';
		list.style.marginTop = (-1 * newWidth / 2) + 'px';
		list.style.marginLeft = (-1 * newWidth / 2) + 'px';
	}

	function flipCard(card) {

		if (card.classList.contains('flipped')) {
			return;
		}

		const index = items.indexOf(card);
		const indexMap = map.indexOf(index);

		const currentSet = cards[map[indexMap]];

		currentSet
			.front
			.setAttribute('title', currentSet.name);
		currentSet
			.front
			.children[0]
			.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + currentSet.name);

		setTimeout(function() {
			if (!currentFlippedOne) {
				card.classList.add('flipped');
				currentFlippedOne = card;
			} else if (!currentFlippedTwo) {
				card.classList.add('flipped');
				currentFlippedTwo = card;

				setTimeout(function() {
					check();
				}, (has3d ? 1000 : 100));
			}
		}, 10);
	}

	function check() {
		rounds++;

		// not the same
		if (currentFlippedOne.querySelectorAll('.front')[0].getAttribute('title') !== currentFlippedTwo.querySelectorAll('.front')[0].getAttribute('title')) {
			currentFlippedOne.classList.add('fail');
			currentFlippedTwo.classList.add('fail');

			const one = currentFlippedOne;
			const two = currentFlippedTwo;

			currentFlippedOne = null;
			currentFlippedTwo = null;

			setTimeout(function() {
				fail(one, two);
			}, 1000);
		} else { // the same
			currentFlippedOne.classList.add('win');
			currentFlippedTwo.classList.add('win');
			currentFlippedOne = null;
			currentFlippedTwo = null;
			match += 2;

			// check if all cards are flipped
			if (match === itemsCount) {
				renderResult();
			}
		}
	}

	function renderResult() {
		list.classList.add('rotate');

		const div = document.createElement('div');

		div.classList.add('overlay');
		div.innerHTML = 'Comparisons: <strong>' + rounds + '</strong>.<br/>Click / Tap here to try again!';

		retryHandler = function() {
			retry(div);
		};

		div.addEventListener((hasTouch) ? 'touchstart' : 'click', retryHandler);

		list.parentElement.appendChild(div);

		setTimeout(function() {
			list.classList.remove('rotate');
		}, 2000);
	}

	function retry(element) {

		let i = itemsCount - 1;

		element.removeEventListener((hasTouch) ? 'touchstart' : 'click', retryHandler);
		element.parentNode.removeChild(element);

		list.classList.remove('rotate');

		do {
			const item = items[i];
			item.classList.remove('win');
			item.classList.remove('flipped');
			i--;
		} while (i > -1)

		setTimeout(function() {
			sort();
		}, 1000);
	}

	function fail(one, two) {
		one.classList.remove('fail');
		one.classList.remove('flipped');

		two.classList.remove('fail');
		two.classList.remove('flipped');

		setTimeout(function() {
			if (!one.classList.contains('flipped')) {
				resetCard(one);
			}

			if (two.classList.contains('flipped')) {
				resetCard(two);
			}
		}, 1000);
	}

	// removes the front of a card
	function resetCard(card) {
		const index = items.call(card);
		const indexMap = map.indexOf(index);
		const currentSet = cards[map[indexMap]];

		if (card.classList.contains('flipped')) {
			return;
		}

		currentSet.front.setAttribute('title', '')
		currentSet.front.children[0].setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '');

		cards[map[indexMap]] = currentSet;
	}

	// sort current set
	function sort() {
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
	}

	sort();
	resizeHandler();
	window.addEventListener('resize', resizeHandler);

	// recursive search the dom for a specific nodename
	function getParent(element, search) {
		var p = element.parentElement;

		if (!p || !p.nodeName) {
			return null;
		}

		if (p.nodeName.toLowerCase() === search) {
			return p;
		} else {
			return getParent(p, search);
		}
	}

	function onCardInteraction(event) {
		var element = event.target,
			nodeName = element.nodeName.toLowerCase();

		if (nodeName !== 'li') {
			element = getParent(element, 'li');

			if (element) {
				nodeName = element.nodeName.toLowerCase();
			}
		}

		if (nodeName === 'li') {
			event.preventDefault();

			if (event.type !== 'mousedown') {
				flipCard(element);
			}
		}
	}

	// clicking a card
	list.addEventListener((hasTouch) ? 'touchstart' : 'click', onCardInteraction);

	// prevent dragging
	list.addEventListener('mousedown', onCardInteraction);
})();
