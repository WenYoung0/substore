// @call = emitContent
const emitContent = ({ config = {} }) => {
  $content = JSON.stringify(config);
  return { config };
};
