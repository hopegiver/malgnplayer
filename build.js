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