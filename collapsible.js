/**
 * Collapsible - A plug and play plugin for expanding and
 * collapsing elements (i.e. accordion) on a website.
 *
 * @author Murtada al Mousawy (https://murtada.nl)
 */
(function() {
  'use strict';

  /**
   * Constructor
   *
   * @param {(HTMLElement|NodeList)} node - The HTML element that will be manipulated.
   * @param {HTMLElement} [eventNode] - The HTML element on which the eventListener will be attached.
   * @param {boolean} [isCollapsed] - A boolean to assign the state of the node element.
   */
  var Collapsible = function(node, eventNode, isCollapsed) {
    if (NodeList.prototype.isPrototypeOf(node)) {
      node.forEach(function(nodeItem) {
        new Collapsible(nodeItem, eventNode, isCollapsed);
      });
      return;
    } else if (node instanceof HTMLElement) {
      this.init(node, eventNode, isCollapsed);
    } else {
      console.error(node, 'is not a NodeList or an instance of HTMLElement');
    }
  };

  /**
   * Initialize the collapsing and expanding functionality
   *
   * @param {(HTMLElement|NodeList)} node - The HTML element that will be manipulated.
   * @param {HTMLElement} [eventNode] - The HTML element on which the eventListener will be attached.
   * @param {boolean} [isCollapsed] - A boolean to assign the state of the node element.
   */
  Collapsible.prototype.init = function(node, eventNode, isCollapsed) {
    this.node = node;
    this.eventNode = this.node.querySelector(eventNode);
    this.updateHeights();

    this.isCollapsed = ((isCollapsed
                         && typeof isCollapsed === 'boolean')
                         ? isCollapsed
                         : false
                       || (typeof this.node.dataset.collapsibleCollapsed !== 'undefined'));

    if (this.isCollapsed) {
      this.node.style.maxHeight = this.collapsedHeight + 'px';
      this.node.classList.add('is-collapsed');
    } else {
      this.node.classList.add('is-expanded');
    }

    this.eventNode.addEventListener('click', function() {
      this.toggleCollapse();
    }.bind(this));

    window.addEventListener('resize', this.updateHeights.bind(this, 0));

    node.collapsible = this;
  };

  /**
   * Update the collapsed and expanded heights on page resize
   */
  Collapsible.prototype.updateHeights = function(heightDifference) {
    heightDifference = heightDifference || 0;

    // Calculate the collapsed height
    this.collapsedHeight = Collapsible.parseNumber(
      window.getComputedStyle(this.eventNode)['height']
    );

    // Calculate the expanded height
    this.node.style.maxHeight = 'unset';

    this.expandedHeight = Collapsible.parseNumber(
      window.getComputedStyle(this.node)['height']
    );

    // Add or subtract the childNode's height difference
    this.expandedHeight += heightDifference;
    this.expandedHeight =  Math.max(this.expandedHeight, this.collapsedHeight);

    // Reset height to what it was before
    if (this.isCollapsed) {
      this.node.style.maxHeight = this.collapsedHeight + 'px';
    }

    this.updateParentNode(this.expandedHeight - this.collapsedHeight);
  };

  /**
   * Toggle the node state and calls the appropriate function
   */
  Collapsible.prototype.toggleCollapse = function() {
    if (this.isCollapsed) {
      this.expand();
    } else {
      this.collapse();
    }
  };

  /**
   * Collapse the node
   */
  Collapsible.prototype.collapse = function() {
    this.node.style.maxHeight = window.getComputedStyle(this.node)['height'];

    void this.node.offsetWidth;

    this.node.style.maxHeight = this.collapsedHeight + 'px';
    this.node.classList.remove('is-expanded');
    this.node.classList.add('is-collapsed');

    this.isCollapsed = true;

    this.updateParentNode(-(this.expandedHeight - this.collapsedHeight));
  };

  /**
   * Expand the node
   */
  Collapsible.prototype.expand = function() {
    this.node.style.height = 'auto';
    this.node.style.maxHeight = this.expandedHeight + 'px';
    this.node.classList.remove('is-collapsed');
    this.node.classList.add('is-expanded');

    this.isCollapsed = false;

    this.updateParentNode(this.expandedHeight - this.collapsedHeight);
  };

  /**
   * Update parent heights if collapsible
   */
  Collapsible.prototype.updateParentNode = function(heightDifference) {
    if (this.node.parentNode.collapsible) {
      this.node.parentNode.collapsible.updateHeights(heightDifference);
    }
  };

  // Helper functions
  Collapsible.parseNumber = function(numberString) {
    return Number.parseInt(numberString.slice(0, -2));
  };

  // Expose the function to the global scope
  window.Collapsible = Collapsible;
})();
