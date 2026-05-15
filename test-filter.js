const finalContent = {
  type: 'doc',
  content: [
    { type: 'paragraph' },
    { type: 'youtube' }
  ]
};

const allNodes = finalContent.content;

finalContent.content = allNodes.filter(
  (node) => {
    if ((node.type === "youtube" || node.type === "iframeEmbed" || node.type === "image") && !node.attrs?.src) {
      return false; // Remove broken media node
    }
    return true;
  }
);

console.log(JSON.stringify(finalContent));
