/* eslint valid-jsdoc: "off" */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {
    mongoose: {
      url: 'mongodb://127.0.0.1:27017/asfor-cli',
      // url: 'mongodb://kk:123456@127.0.0.1:27017/asfor',
    }
  };

  

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1727580362425_7996';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
