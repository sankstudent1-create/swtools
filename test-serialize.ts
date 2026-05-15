import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: "http://localhost" });
global.document = dom.window.document;
global.window = dom.window as any;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;

import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { SafeYoutube } from './src/lib/blog/safe-youtube';

const editor = new Editor({
  extensions: [Document, Paragraph, Text, SafeYoutube],
  content: {
    type: 'doc',
    content: [{ type: 'paragraph' }]
  }
});

editor.commands.setYoutubeVideo({ src: 'https://youtube.com/watch?v=123' });
console.log(JSON.stringify(editor.getJSON(), null, 2));
