module.exports = {
  hooks: {
    readPackage(pkg) {
      // Fix peer dependency issues
      if (pkg.peerDependencies) {
        delete pkg.peerDependencies.react;
        delete pkg.peerDependencies['react-dom'];
      }
      return pkg;
    },
  },
};

