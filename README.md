# ScrollBlum

A petite vanilla js infinite scroller. Derived from the Google Chrome Console Sources.

The current state of frameworky infinite scroller libraries perplexed the Blum and was enough to make the man snap out of his subliminally medicated state, to build a tiny and performant vanilla js infinite scroller.

<img src=https://raw.githubusercontent.com/vegetableman/Scrollblum/master/scrollblum.gif width="400"/>

## Example

```js

const scrollBlum = require('scrollblum');

const sb = scrollBlum('.list', {
  rowsCount: 100,
  rowHeight: 150,
  rowRenderer: ((index) => {
    return document.createElement('div')
  })
});

// Used to update the row height on an index
sb.setRowHeight(10, 200);
```

## Usage

```js
scrollBlum(container, options)
```

`Container` The dom node container to append the list to. Could be a classname or dom node selector. (String | node)

Options:

 - `rowsCount` The number of rows on the container
 - `rowHeight` The height of a single row
 - `rowRenderer` Should return the dom node to be rendered as a row (node)

 Methods:

  - `setRowHeight(index, height)` Update the row height for a row at a particular index.
