/* eslint-env shelljs */

const expect = require('chai').expect;
const path = require('path');
const knownPaths = require('./modules/known-paths');
const fs = require('fs');

describe('orion-compile', () => {
  /**
   * Creates a package with an index.js in src and a
   * package.json with {orion: compiled: ?}
   */
  function createPackage(name, compile) {
    const pkgSrc = "console.log('hello javascript!');";
    const pkgPath = path.join(knownPaths.packages, name);

    mkdir('-p', path.join(pkgPath, 'src'));
    fs.writeFileSync(path.join(pkgPath, 'src', 'index.js'), pkgSrc);
    fs.writeFileSync(path.join(pkgPath, 'package.json'), JSON.stringify({
      orion: { compile },
    }));

    return pkgPath;
  }

  /**
   * Deletes a package by name
   */
  function deletePackage(name) {
    const pkgPath = path.join(knownPaths.packages, name);

    if (test('-e', pkgPath)) {
      rm('-r', pkgPath);
    }
  }

  afterEach(() => {
    ['package1', 'package2', 'package3'].forEach(deletePackage);
  });

  it('builds all packages which have orion.compile=true in package.json', function testWithTimeout() {
    this.timeout(30000); // this might get slow since we compile everything in packages

    const path1 = createPackage('package1', true);
    const path2 = createPackage('package2', true);
    const path3 = createPackage('package3', false);

    const code = exec('node orion.js compile', { silent: true }).code;
    expect(code).to.equal(0);

    expect(test('-e', path.join(path1, 'lib', 'index.js'))).to.equal(true);
    expect(test('-e', path.join(path2, 'lib', 'index.js'))).to.equal(true);
    expect(test('-e', path.join(path3, 'lib', 'index.js'))).to.equal(false);
  });

  it('builds specific packages when passed the --packages flag', () => {
    const path1 = createPackage('package1', true);
    const path2 = createPackage('package2', true);

    const code = exec('node orion.js compile --packages=package1', { silent: true }).code;
    expect(code).to.equal(0);

    expect(test('-e', path.join(path1, 'lib', 'index.js'))).to.equal(true);
    expect(test('-e', path.join(path2, 'lib', 'index.js'))).to.equal(false);
  });
});