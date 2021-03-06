// Partially derived from Google Chrome Console Code ... Partially
// License ..uhmm.. yeah.. whatever

import h from 'hyperscript'
import $ from 'queryselectorall'
import css from 'css-styler'
import raf from 'raf'
import debounce from 'debounce'
import EventEmitter from 'event-emitter-es6'

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


class ScrollBlum extends EventEmitter {
  constructor (container, opts) {
    super();

    if (!container || !$(container).length)
      throw new Error('Please provide a valid container');

    this.rowsCount = opts.rowsCount;
    this.rowRenderer = opts.rowRenderer;
    this.rowHeight = opts.rowHeight;
    this.overscanCount = opts.overscanCount || 0;

    this.rowHeights = new Int32Array(this.rowsCount);
    this.rowHeights.fill(this.rowHeight);
    this.rafId = null;
    this.onScroll = this.onScroll.bind(this);
    this.scrollToIndex = this.scrollToIndex.bind(this);
    this.refresh = this.refresh.bind(this);
    this.setRowHeight = this.setRowHeight.bind(this);
    this.onScrollEnd = this.onScrollEnd.bind(this);
    this.debouncedScrollEnd = debounce(this.onScrollEnd, 150);
    this.renderedItems = [];

    this.reBuildCumulativeHeight();

    container = $(container)[0];
    this.containerHeight = container.offsetHeight;

    let scrollContainer = this.initRender()
    container.appendChild(scrollContainer);

    this.scrollContainer = scrollContainer;
    this.topGap = this.scrollContainer.children[0];
    this.contentElement =  this.scrollContainer.children[1];
    this.bottomGap = this.scrollContainer.children[2];
  }

  getVisibleIndexes (scrollTop) {
    let firstVisibleIndex = Math.max(lowerBound(this.cumulativeHeights, scrollTop), 0),
        lastVisibleIndex = Math.min(firstVisibleIndex + (Math.ceil(this.containerHeight / this.rowHeight) - 1), this.rowsCount - 1);

    firstVisibleIndex = Math.max(firstVisibleIndex - this.overscanCount, 0);
    lastVisibleIndex = Math.min(lastVisibleIndex + this.overscanCount, this.rowsCount - 1);

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
    this.debouncedScrollEnd();
  }

  onScrollEnd () {
    this.emit('scroll-end');
  }

  scrollToIndex (index) {
    this.scrollContainer.scrollTop = this.cumulativeHeights[index];
  }

  refresh () {
    const scrollTop = this.scrollContainer.scrollTop,
          { firstVisibleIndex, lastVisibleIndex } = this.getVisibleIndexes(scrollTop);

    if (firstVisibleIndex < lastVisibleIndex) {
      // set the height of the gaps
      css(this.topGap, {
        height: (this.cumulativeHeights[firstVisibleIndex - 1] || 0) + 'px'
      });

      css(this.bottomGap, {
        height: (this.cumulativeHeights[this.cumulativeHeights.length - 1] - this.cumulativeHeights[lastVisibleIndex]) + 'px'
      });

      // find the visible items
      let visibleItems = [];
      for (let i = firstVisibleIndex; i<= lastVisibleIndex; ++i) {
        visibleItems.push(String(i));
      }

      // find items to remove
      let items = Array.from(this.contentElement.children);

      for (let item of items) {
        let itemKey = item.dataset['key'];
        if (visibleItems.indexOf(itemKey) < 0) {
          this.contentElement.removeChild(item);
        }
      }

      // find items to add
      let anchor = this.contentElement.firstChild;
      for (let item of visibleItems) {
        if (!anchor || item !== anchor.dataset['key']) {
          this.contentElement.insertBefore(this.getRow(item), anchor);
        }
        else {
          anchor = anchor.nextSibling;
        }
      }
    }
  }

  reBuildCumulativeHeight () {
    this.cumulativeHeights = new Int32Array(this.rowsCount);

    let height = 0;
    for (let i = 0; i < this.rowsCount; i++) {
      height += this.rowHeights[i];
      this.cumulativeHeights[i] = height;
    }
  }

  initRender () {
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
        h('div.top-gap', {
          style: {
            height: 0 + 'px'
          }
        }),
        h('div.content', rows),
        h('div.bottom-gap', {
          style: {
            height: this.cumulativeHeights[this.cumulativeHeights.length - 1] + 'px'
          }
        })
      )
    );
  }
}

export default ScrollBlum;
