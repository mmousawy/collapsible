(function() {
	var titles = ['Quod eligendi',
							 'Aliquid ratione',
							 'Dolorem delectus',
							 'Odio quas',
							 'Blanditiis possimus',
							 'Obcaecati doloremque'];

	var paragraphs = [
		'Incidunt illum accusantium deserunt eius consequatur corporis repellat nesciunt et, unde esse. Maxime dolores, veniam vel eos aut culpa perferendis sint voluptas.',
		'Unde, in, amet asperiores voluptates eaque repudiandae, maiores vero reiciendis expedita similique ullam qui facilis tempore debitis. Aliquam deleniti quae voluptas laboriosam.',
		'Tempora ea nisi delectus ipsam facere vero eaque, quia quaerat ipsa at earum amet voluptatum praesentium veniam voluptate reiciendis libero officiis officia?'
	];

	document.querySelectorAll('.add-item').forEach(function(button) {
		button.addEventListener('click', addItem);
	});

	document.querySelectorAll('.remove-item').forEach(function(button) {
		button.addEventListener('click', removeItem);
	});

	function createBlock() {
		var blockTemplate = document.createElement('div');
		blockTemplate.classList.add('block');
		blockTemplate.innerHTML =
			'<div class="block__title">' +
				'<h3>' + titles[Math.floor(Math.random() * 6)] + '</h3>' +
			'</div>' +
			'<div class="block__content">' +
				'<p>' + paragraphs[Math.floor(Math.random() * 3)] + '</p>' +
			'</div>';

			return blockTemplate;
	}

	function addItem(event) {
		var target = document.querySelector(event.target.dataset.target);

		var newBlock = createBlock();

		target.appendChild(newBlock);

		new Collapsible({
			node: newBlock,
			eventNode: '.block__title',
			isCollapsed: true,
			expandCallback: logCallback,
			collapseCallback: logCallback
		});
	}

	function removeItem(event) {
		var target = document.querySelector(event.target.dataset.target);

		var lastBlock = target.querySelector('.block:last-of-type');

		lastBlock && target.removeChild(lastBlock);
	}

	// Init Collapsible for categories and blocks on page load
	var categories = document.querySelectorAll('.category'),
			blocks = document.querySelectorAll('.block'),
			log = document.querySelector('.log');

	new Collapsible({
			node: blocks,
			eventNode: '.block__title',
			isCollapsed: true,
			expandCallback: logCallback,
			collapseCallback: logCallback
		}
	);

	new Collapsible({
			node: categories,
			eventNode: '.category__title',
			isCollapsed: false,
			observe: true,
			expandCallback: logCallback,
			collapseCallback: logCallback,
			mutationCallback: logCallback
		}
	);

	// Listen to 'toggle' event
	categories.forEach(function(category) {
		category.addEventListener('toggle', function(event) {
			console.log('Toggle event triggered:', event);
		});

		category.addEventListener('mutate', function(event) {
			console.log('Mutate event triggered:', event);
		});
	})

	// The callback used in options
	function logCallback(event) {
		console.log('Callback triggered:', this, event);
		log.value = event.detail.action + ' ' +
			(event.type === 'toggle'
				? this.node.classList[0]
				: this.node.classList[1])
			+ '\n' + log.value;
	}
})();
