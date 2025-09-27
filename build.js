const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

const baseConfig = {
  entryPoints: ['src/malgnplayer.js'],
  bundle: true,
  minify: true,
  sourcemap: false,
  target: ['es2015'],
  external: [],
  platform: 'browser',
};

const builds = [
  {
    ...baseConfig,
    outfile: 'dist/malgnplayer.min.js',
    format: 'iife',
    globalName: 'MalgnPlayer',
  },
  {
    ...baseConfig,
    outfile: 'dist/malgnplayer.esm.js',
    format: 'esm',
  },
];

async function createUMDWrapper() {
  const esmContent = fs.readFileSync('dist/malgnplayer.esm.js', 'utf8');

  const umdWrapper = `(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.MalgnPlayer = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
${esmContent.replace(/export\s+default\s+/, 'return ')}
}));`;

  fs.writeFileSync('dist/malgnplayer.umd.js', umdWrapper);
  console.log('Built dist/malgnplayer.umd.js');
}

async function copyLibs() {
  // Create libs directory in dist
  const libsDir = 'dist/libs';
  if (!fs.existsSync(libsDir)) {
    fs.mkdirSync(libsDir, { recursive: true });
  }

  // Copy HLS library
  const hlsSource = 'src/libs/hls.min.js';
  const hlsTarget = 'dist/libs/hls.min.js';

  if (fs.existsSync(hlsSource)) {
    fs.copyFileSync(hlsSource, hlsTarget);
    console.log('Copied libs/hls.min.js');
  }
}

async function build() {
  try {
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist');
    }

    // Copy libraries
    await copyLibs();

    for (const config of builds) {
      if (isWatch) {
        const ctx = await esbuild.context(config);
        await ctx.watch();
        console.log(`Watching ${config.outfile}...`);
      } else {
        await esbuild.build(config);
        console.log(`Built ${config.outfile}`);
      }
    }

    if (!isWatch) {
      await createUMDWrapper();
    }

    if (isWatch) {
      console.log('Watching for changes...');
    } else {
      console.log('Build completed!');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();