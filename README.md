# ScrollBlum

A petite vanilla js virtual list. Derived from the Google Chrome Console Source.

The current state of frameworky virtual list libraries perplexed "The Blum" and was enough to make the man snap out of his perpetual medicated state, to build a tiny and performant vanilla js virtual list.

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

## Install

```js

npm i scrollblum --save

```

## Run Example

``` js

npm start

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
 - `overscanCount` The number of extra elements to render above/below the visible items (inspired by react-tiny-virtual-list)

Methods:

 - `setRowHeight(index, height)` Update the row height for a row at a particular index.
 - `scrollToIndex` The index in the list to scroll to

