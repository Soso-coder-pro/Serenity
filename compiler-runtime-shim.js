'use strict';
// Shim for react/compiler-runtime — provides useMemoCache for React 18
const { useState } = require('react');
const SENTINEL = Symbol.for('react.memo_cache_sentinel');
exports.c = function useMemoCache(size) {
  return useState(function () {
    var data = new Array(size);
    for (var i = 0; i < size; i++) data[i] = SENTINEL;
    return data;
  })[0];
};
