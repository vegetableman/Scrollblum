import scrollBlum from '../index.es6'
import h from 'hyperscript'
import domReady from 'domready'

domReady(() => {
  document.body.appendChild(h('div.list'));

  const sb = scrollBlum('.list', {
    rowsCount: 100,
    rowHeight: 150,
    rowRenderer: ((index) => {
      return h('div.scroll-item', index);
    })
  });

});
