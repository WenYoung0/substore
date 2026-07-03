// @call = emitContent
const emitContent = ({ config = {} }) => {
  $content = JSON.stringify(config, null, 2);
  return { config };
};
