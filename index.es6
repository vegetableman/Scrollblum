// Partially derived from Google Chrome Console Code ... Partially
// License ..uhmm.. yeah.. whatever

import h from 'hyperscript'
import $ from 'queryselectorall'
import css from 'css-styler'
import raf from 'raf'

const lowerBound = (arr, value) => {
  function defaultComparator(a, b) {
    return a < b ? -1 : (a > b ? 1 : 0);
  }

  let left = 0,
      right = arr.length;

  while (left < right) {
    let m = (left + right) >> 1;
    if (defaultComparator(value, arr[m]) > 0)
        left = m + 1;
    else
        right = m;
  }

  return right;
};


class ScrollBlum {
  constructor (container, opts) {
    this.rowsCount = opts.rowsCount;
    this.rowRenderer = opts.rowRenderer;
    this.rowHeight = opts.rowHeight;
    this.rowHeights = this.cumulativeHeights = new Int32Array(this.rowsCount);
    this.rowHeights.fill(this.rowHeight);
    this.firstVisibleIndex = 0;
    this.lastVisibleIndex = -1;
    this.rafId = null;
    this.onScroll = this.onScroll.bind(this);
    this.refresh = this.refresh.bind(this);
    this.setRowHeight = this.setRowHeight.bind(this);
    this.renderedItems = [];

    container = container[0];
    this.containerHeight = container.offsetHeight;
    container.appendChild(this.render());

    this.reBuildCumulativeHeight();
  }

  getVisibleIndexes (scrollTop) {
    const firstVisibleIndex = Math.max(lowerBound(this.cumulativeHeights, scrollTop), 0),
          lastVisibleIndex = Math.min(firstVisibleIndex + (Math.ceil(this.containerHeight / this.rowHeight) - 1), this.rowsCount - 1);

    return {
      firstVisibleIndex,
      lastVisibleIndex
    }
  }

  getRow (index) {
    let row = this.rowRenderer(index);
    row.dataset['key'] = index;
    return row;
  }

  setRowHeight (index, height) {
    this.rowHeights[index] = height;
    this.reBuildCumulativeHeight();
  }

  onScroll (e) {
    if (this.rafId) { raf.cancel(this.rafId); }
    this.rafId = raf(this.refresh);
  }

  refresh () {
    this.rafId = null;

    if (!this.cumulativeHeights) return;

    const scrollContainer = $('.scroll-container')[0],
          scrollTop = scrollContainer.scrollTop,
          topGap = $('.top-gap')[0],
          bottomGap = $('.bottom-gap')[0],
          contentElement = $('.content')[0],
          { firstVisibleIndex, lastVisibleIndex } = this.getVisibleIndexes(scrollTop);

    if (firstVisibleIndex < lastVisibleIndex) {
      // set the height of the gaps
      css(topGap, {
        height: (this.cumulativeHeights[firstVisibleIndex - 1] || 0) + 'px'
      });

      css(bottomGap, {
        height: (this.cumulativeHeights[this.cumulativeHeights.length - 1] - this.cumulativeHeights[lastVisibleIndex]) + 'px'
      });

      // find the visible items
      let visibleItems = [];
      for (let i = firstVisibleIndex; i<= lastVisibleIndex; ++i) {
        visibleItems.push(String(i));
      }

      // find items to remove
      let items = Array.from(contentElement.children);

      for (let item of items) {
        let itemKey = item.dataset['key'];
        if (visibleItems.indexOf(itemKey) < 0) {
          item.parentNode.removeChild(item);
        }
      }

      // find items to add
      let anchor = contentElement.firstChild;
      for (let item of visibleItems) {
        if (!anchor || item !== anchor.dataset['key']) {
          contentElement.insertBefore(this.getRow(item), anchor);
        }
        else {
          anchor = anchor.nextSibling;
        }
      }
    }
  }

  reBuildCumulativeHeight () {
    let height = 0;
    for (let i = 0; i < this.rowsCount; i++) {
      height += this.rowHeights[i];
      this.cumulativeHeights[i] = height;
    }
  }

  render () {
    const rows = [],
        { firstVisibleIndex, lastVisibleIndex } = this.getVisibleIndexes(1);

    for (let i = firstVisibleIndex; i <= lastVisibleIndex; ++i) {
      let row = this.getRow(i);
      rows.push(row);
    }

    return (
      h('div.scroll-container', {
          style: {
            overflow: 'auto',
            transform: 'translateZ(0)'
          },
          onscroll: this.onScroll
        },
        h('div.top-gap'),
        h('div.content', rows),
        h('div.bottom-gap')
      )
    );
  }
}

export default (() => {
    return (container, opts = {}) => {
      if (!container)
        throw new Error('Please provider a container');

      return new ScrollBlum($(container), opts);
    };
})();
