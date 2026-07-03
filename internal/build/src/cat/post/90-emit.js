// @call = emitContent
const emitContent = ({ config = {} }) => {
  $content = ProxyUtils.yaml.dump(config);
  return { config };
};
