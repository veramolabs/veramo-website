const path = require('path');

module.exports = function cytoscapeAliasPlugin(context, options) {
  return {
    name: 'cytoscape-alias-plugin',

    modifyWebpackConfig(config) {
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      // Alias the UMD build to the ESM build to avoid export issues
      config.resolve.alias['cytoscape/dist/cytoscape.umd.js'] = path.resolve(
        __dirname,
        'node_modules',
        'cytoscape',
        'dist',
        'cytoscape.esm.mjs'
      );
      return config;
    },
  };
};
