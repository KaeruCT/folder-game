const { loaderByName, addBeforeLoader } = require('@craco/craco');

module.exports = {
    plugins: [
        {
            plugin: {
                overrideWebpackConfig: ({ webpackConfig }) => {
                    addBeforeLoader(webpackConfig, loaderByName('file-loader'), {
                        test: /\.txt$/i,
                        use: 'raw-loader',
                    });
                    return webpackConfig;
                }
            }
        }
    ]
};