// Memory

// (c) 2010-2020 Lars Laade
// MIT license

const has3d = Modernizr.csstransforms3d;
const hasTouch = Modernizr.touch;

const XLINK_NS = 'http://www.w3.org/1999/xlink';
const XLINK_HREF = 'xlink:href';
const CSS_CLASS_FLIPPED = 'flipped';
const CSS_CLASS_WIN = 'win';
const CSS_CLASS_FAIL = 'fail';
const CSS_CLASS_ROTATE = 'rotate';
const EVENT_ACTION = (hasTouch) ? 'touchstart' : 'click';

const list = document.getElementById('card_list');
const items = Array.prototype.slice.call(document.querySelectorAll('.card'), 0);
const itemsCount = items.length;

let cards = [];
let map = [];
let currentFlippedOne = null;
let currentFlippedTwo = null;
let match = 0;
let rounds = 0;
let retryHandler;

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
		front.children[0].setAttributeNS(XLINK_NS, XLINK_HREF, '');

		map.push(i);
	}
}

function flipCard(card) {

	if (card.classList.contains(CSS_CLASS_FLIPPED)) {
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
		.setAttributeNS(XLINK_NS, XLINK_HREF, '#' + currentSet.name);

	setTimeout(() => {
		if (!currentFlippedOne) {
			card.classList.add(CSS_CLASS_FLIPPED);
			currentFlippedOne = card;
		} else if (!currentFlippedTwo) {
			card.classList.add(CSS_CLASS_FLIPPED);
			currentFlippedTwo = card;

			setTimeout(() => {
				check();
			}, (has3d ? 1000 : 100));
		}
	}, 10);
}

function check() {
	rounds++;

	// not the same
	if (currentFlippedOne.querySelectorAll('.front')[0].getAttribute('title') !== currentFlippedTwo.querySelectorAll('.front')[0].getAttribute('title')) {
		currentFlippedOne.classList.add(CSS_CLASS_FAIL);
		currentFlippedTwo.classList.add(CSS_CLASS_FAIL);

		const one = currentFlippedOne;
		const two = currentFlippedTwo;

		currentFlippedOne = null;
		currentFlippedTwo = null;

		setTimeout(function() {
			fail(one, two);
		}, 1000);
	} else { // the same
		currentFlippedOne.classList.add(CSS_CLASS_WIN);
		currentFlippedTwo.classList.add(CSS_CLASS_WIN);
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
	list.classList.add(CSS_CLASS_ROTATE);

	const div = document.createElement('div');

	div.classList.add('overlay');
	div.innerHTML = `Comparisons: <strong>${rounds}</strong>.<br/>Click / Tap here to try again!`;

	retryHandler = function() {
		retry(div);
	};

	div.addEventListener(EVENT_ACTION, retryHandler);

	list.parentElement.appendChild(div);

	setTimeout(function() {
		list.classList.remove(CSS_CLASS_ROTATE);
	}, 2000);
}

function retry(element) {

	let i = itemsCount - 1;

	element.removeEventListener(EVENT_ACTION, retryHandler);
	element.parentNode.removeChild(element);

	list.classList.remove(CSS_CLASS_ROTATE);

	do {
		const item = items[i];
		item.classList.remove(CSS_CLASS_WIN);
		item.classList.remove(CSS_CLASS_FLIPPED);
		i--;
	} while (i > -1)

	setTimeout(sort, 1000);
}

function fail(one, two) {
	one.classList.remove(CSS_CLASS_FAIL);
	one.classList.remove(CSS_CLASS_FLIPPED);

	two.classList.remove(CSS_CLASS_FAIL);
	two.classList.remove(CSS_CLASS_FLIPPED);

	setTimeout(() => {
		if (!one.classList.contains(CSS_CLASS_FLIPPED)) {
			resetCard(one);
		}

		if (two.classList.contains(CSS_CLASS_FLIPPED)) {
			resetCard(two);
		}
	}, 1000);
}

// removes the front of a card
function resetCard(card) {
	const index = items.indexOf(card);
	const indexMap = map.indexOf(index);
	const currentSet = cards[map[indexMap]];

	if (card.classList.contains(CSS_CLASS_FLIPPED)) {
		return;
	}

	currentSet.front.setAttribute('title', '')
	currentSet.front.children[0].setAttributeNS(XLINK_NS, XLINK_HREF, '');

	cards[map[indexMap]] = currentSet;
}

// sort current set
function sort() {
	let item,
		done = [],
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

// recursive search the dom for a specific nodename
function closest(element, search) {

	if (!element || !element.nodeName) {
		return null;
	}

	if (element.nodeName.toLowerCase() === search) {
		return element;
	} else {
		return closest(element.parentElement, search);
	}
}

function onCardInteraction(event) {
	const element = closest(event.target, 'li');

	if (element) {
		event.preventDefault();

		if (event.type !== 'mousedown') {
			flipCard(element);
		}
	}
}

// clicking a card
list.addEventListener(EVENT_ACTION, onCardInteraction);

// prevent dragging
list.addEventListener('mousedown', onCardInteraction);
