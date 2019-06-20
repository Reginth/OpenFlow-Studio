const monaco = require('monaco-editor/esm/vs/editor/editor.api');
monaco.editor.create(document.getElementById('container'), {
  value: [
    'function x() {',
    '\tconsole.log("Hello world!");',
    '}'
  ].join('\n'),
  language: 'javascript'
});