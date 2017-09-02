import scrollBlum from '../index.es6'
import h from 'hyperscript'
import domReady from 'domready'

domReady(() => {
  document.body.appendChild(h('div.list'));

  const sb = new scrollBlum('.list', {
    rowsCount: 100,
    rowHeight: 150,
    overscanCount: 5,
    rowRenderer: ((index) => {
      return h('div.scroll-item', index);
    })
  });

  sb.on('scroll-end', () => {
  	console.log('Scroll has reached the end');
  })

});
