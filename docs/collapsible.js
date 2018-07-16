/**
 * Collapsible - A plug and play plugin for expanding and
 * collapsing elements (i.e. accordion) on a website.
 *
 * @author Murtada al Mousawy (https://murtada.nl)
 */
(function() {
  'use strict';

  /**
   * Creates an instance of Collapsible.
   *
   * @constructor
   * @param {Object} options
   * @param {(HTMLElement|NodeList)} options.node The HTML elements that will be manipulated.
   * @param {HTMLElement} [options.eventNode] The HTML element on which the eventListener will be attached.
   * @param {Boolean} [options.isCollapsed] Assign the state of the node element.
   * @param {Boolean} [options.observe] Assign a MutationObserver to observe child DOM changes.
   * @param {Function} [options.expandCallback] Assign a callback for the [{@link Collapsible.prototype.expand} event.
   * @param {Function} [options.collapseCallback] Assign a callback for the {@link Collapsible.prototype.collapse} event.
   * @param {Function} [options.observeCallback] Assign a callback for the {@link Collapsible.prototype.initObserver} event.
   */
  var Collapsible = function(options) {
    // Initialize HTML nodes
    if (NodeList.prototype.isPrototypeOf(options.node)) {
      options.node.forEach(function(nodeItem) {
        var singleNodeOptions = options;
        singleNodeOptions.node = nodeItem;
        new Collapsible(singleNodeOptions);
      });
      return;
    } else if (options.node instanceof HTMLElement) {
      this.node = options.node;
      this.eventNode = (options.eventNode ? this.node.querySelector(options.eventNode) : this.node);
      this.isCollapsed = (typeof this.node.dataset.collapsibleCollapsed !== 'undefined'
                          ? true
                          : null);

      if (!this.isCollapsed) {
        this.isCollapsed = ((options.isCollapsed
                            && typeof options.isCollapsed === 'boolean')
                            ? options.isCollapsed
                            : false);
      }

      this.observe = (typeof options.observe === 'boolean' ? options.observe : false);
      this.expandCallback = (typeof options.expandCallback === 'function' ? options.expandCallback : null);
      this.collapseCallback = (typeof options.collapseCallback === 'function' ? options.collapseCallback : null);
      this.observeCallback = (typeof options.observeCallback === 'function' ? options.observeCallback : null);
      this.mutationCallback = (typeof options.mutationCallback === 'function' ? options.mutationCallback : null);

      this.init();
    } else {
      console.error(options.node, 'is not a NodeList or an instance of HTMLElement');
    }
  };

  /**
   * Initialize the collapsing and expanding events.
   */
  Collapsible.prototype.init = function() {
    this.updateHeights();

    if (this.isCollapsed) {
      this.node.style.height = this.collapsedHeight + 'px';
      this.node.classList.add('is-collapsed');
    } else {
      this.node.classList.add('is-expanded');
    }

    this.eventNode.addEventListener('click', function() {
      this.toggleCollapse();
    }.bind(this));

    window.addEventListener('resize', this.updateHeights.bind(this, null));

    // Observe children of the node
    if (this.observe) {
      this.initObserver();
    }

    // Attach the prototype instance to the node
    this.node.collapsible = this;
  };

  /**
   * Update the collapsed and expanded heights on page resize.
   *
   * @param {int} [heightDifference] Height value to add or subtract from the parent.
   */
  Collapsible.prototype.updateHeights = function(heightDifference) {
    heightDifference = heightDifference || 0;

    // Calculate the collapsed height
    this.collapsedHeight = Collapsible.parseNumber(
      window.getComputedStyle(this.eventNode)['height']
    );

    // Calculate the expanded height
    this.node.style.height = 'auto';

    this.expandedHeight = Collapsible.parseNumber(
      window.getComputedStyle(this.node)['height']
    );

    // Add or subtract the childNode's height difference
    this.expandedHeight += heightDifference;
    this.expandedHeight =  Math.max(this.expandedHeight, this.collapsedHeight);

    // Reset height to what it was before
    if (this.isCollapsed) {
      this.node.style.height = this.collapsedHeight + 'px';
    }

    this.updateParentNode(this.expandedHeight - this.collapsedHeight);
  };

  /**
   * Toggle the node state and calls the appropriate function.
   */
  Collapsible.prototype.toggleCollapse = function() {
    if (this.isCollapsed) {
      this.expand();
    } else {
      this.collapse();
    }
  };

  /**
   * Expand the node.
   */
  Collapsible.prototype.expand = function() {
    this.updateHeights();

    void this.node.offsetWidth;

    this.node.style.height = 'auto';
    this.node.style.height = this.expandedHeight + 'px';
    this.node.classList.remove('is-collapsed');
    this.node.classList.add('is-expanded');

    this.isCollapsed = false;

    // Create a custom event
    var expandEvent = new CustomEvent('toggle', {
      bubbles: true,
      detail: {
        action: 'expand',
        origin: this.eventNode
      }
    });

    this.node.dispatchEvent(expandEvent);

    // Run callback if it exists
    if (this.expandCallback) {
      this.expandCallback.bind(this, expandEvent)();
    }

    this.updateParentNode(this.expandedHeight - this.collapsedHeight);
  };

  /**
   * Collapse the node.
   */
  Collapsible.prototype.collapse = function() {
    this.node.style.height = window.getComputedStyle(this.node)['height'];

    void this.node.offsetWidth;

    this.node.style.height = this.collapsedHeight + 'px';
    this.node.classList.remove('is-expanded');
    this.node.classList.add('is-collapsed');

    this.isCollapsed = true;

    // Create a custom event
    var collapseEvent = new CustomEvent('toggle', {
      bubbles: true,
      detail: {
        action: 'collapse',
        origin: this.eventNode
      }
    });

    this.node.dispatchEvent(collapseEvent);

    // Run callback if it exists
    if (this.collapseCallback) {
      this.collapseCallback.bind(this, collapseEvent)();
    }

    this.updateParentNode(-(this.expandedHeight - this.collapsedHeight));
  };

  /**
   * Update parent heights if collapsible.
   *
   * @see {@link Collapsible.prototype.updateHeights}
   */
  Collapsible.prototype.updateParentNode = function(heightDifference) {
    if (this.node.parentNode && this.node.parentNode.collapsible) {
      this.node.parentNode.collapsible.updateHeights(heightDifference);
    }
  };

  /**
   * Observe the direct children list of the node.
   * Will adjust the expanded height automatically if necessary.
   */
  Collapsible.prototype.initObserver = function() {
    this.mutationObserver = new window.MutationObserver(function(mutationsList) {
      var mutatedNode,
          mutationAction;

      if (mutationsList[0]['addedNodes'].length > 0) {
        mutationAction = 'add';
        mutatedNode = mutationsList[0]['addedNodes'][0];
      } else {
        mutationAction = 'remove';
        mutatedNode = mutationsList[0]['removedNodes'][0];
      }

      if (!this.isCollapsed) {
        var mutatedNodeStyle = window.getComputedStyle(mutatedNode);

        var mutatedNodeHeight =
            Collapsible.parseNumber(
            mutatedNodeStyle['height']) +
            Collapsible.parseNumber(
            mutatedNodeStyle['margin-top']) +
            Collapsible.parseNumber(
            mutatedNodeStyle['margin-bottom']);

        this.node.style.height = 'auto';

        var currentHeight = Collapsible.parseNumber(
          window.getComputedStyle(this.node)['height']
        );

        if (mutationAction == 'add') {
          this.node.style.height = (currentHeight - mutatedNodeHeight) + 'px';
          void this.node.offsetWidth;
          this.node.style.height = currentHeight + 'px';
        } else {
          this.node.style.height = this.expandedHeight + 'px';
          void this.node.offsetWidth;
          this.node.style.height = currentHeight + 'px';
        }
      }

      this.expandedHeight = currentHeight;

      // Create a custom event
      var mutationEvent = new CustomEvent('mutate', {
        bubbles: true,
        detail: {
          action: mutationAction,
          node: mutatedNode
        }
      });

      this.node.dispatchEvent(mutationEvent);

      // Run callback if it exists
      if (this.mutationCallback) {
        this.mutationCallback.bind(this, mutationEvent)();
      }
    }.bind(this));

    this.mutationObserver.observe(this.node, {
      childList: true
    });
  };

  // Helper functions
  Collapsible.parseNumber = function(numberString) {
    return Number.parseInt(numberString.slice(0, -2));
  };

  // Expose the prototype function to the global scope
  window.Collapsible = Collapsible;
})();
