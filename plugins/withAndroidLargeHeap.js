const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidLargeHeap(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application[0];
    application.$['android:largeHeap'] = 'true';
    return config;
  });
};
