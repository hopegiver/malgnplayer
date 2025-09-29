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
  // HLS library is now dynamically loaded only when needed
  // Clean up any existing libs directory
  const libsDir = 'dist/libs';
  if (fs.existsSync(libsDir)) {
    fs.rmSync(libsDir, { recursive: true, force: true });
    console.log('Removed dist/libs directory - using dynamic loading');
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