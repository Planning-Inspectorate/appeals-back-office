import alias from '@rollup/plugin-alias';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import rollupPluginBeep from '@rollup/plugin-beep';
import rollupPluginCJS from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import rollupPluginReplace from '@rollup/plugin-replace';
import rollupPluginVirtual from '@rollup/plugin-virtual';
import kleur from 'kleur';
import fs from 'node:fs';
import { rollup } from 'rollup';
import iife from 'rollup-plugin-iife';
import { visualizer } from 'rollup-plugin-visualizer';
import { loadBaseConfig } from '@pins/appeals.web/environment/base-config.js';
import { getLogger } from './get-logger.js';
import { minifySource } from './minify-js.js';
import { buildVirtualJSON } from './rollup-plugin-virtual-json.js';

const { buildDir, env, bundleAnalyzer, isProduction, isRelease } = loadBaseConfig();
const logger = getLogger({ scope: 'JS' });

process.on('unhandledRejection', (reason, p) => {
	logger.error('Build had unhandled rejection', reason, p);
	throw new Error(`Build had unhandled rejection ${reason}`);
});

const virtualImports = {
	pi_config: {
		isProduction,
		env: env || 'dev',
		version: `v${new Date().toISOString().replace(/\D/g, '').slice(0, 12)}`
	}
};

/**
 * Reusable function to build a single JavaScript bundle using Rollup.
 * @param {string} inputPath - The path to the entrypoint JS file.
 * @param {string} outputName - The desired name of the output file (without extension).
 * @returns {Promise<any>}
 */
async function buildBundle(inputPath, outputName) {
	logger.log(
		`Bundling (${isProduction ? kleur.magenta('production') : kleur.magenta('development')})`,
		kleur.blue(inputPath)
	);

	const appBundle = await rollup({
		input: inputPath,
		plugins: [
			nodeResolve({ jsnext: true, main: true, browser: true, preferBuiltins: false }),
			rollupPluginCJS({}),
			rollupPluginReplace({
				values: {
					__buildEnv__: isProduction ? JSON.stringify('production') : JSON.stringify('development'),
					'process.env.NODE_ENV': isProduction
						? JSON.stringify('production')
						: JSON.stringify('development')
				},
				preventAssignment: true
			}),
			rollupPluginVirtual(buildVirtualJSON(virtualImports)),
			rollupPluginBeep(),
			getBabelOutputPlugin({ exclude: 'node_modules/**' }),
			alias({ entries: {} }),
			iife(),
			...(bundleAnalyzer
				? [visualizer({ filename: `${outputName}-stats.html`, open: true, gzipSize: true })]
				: [])
		],
		preserveEntrySignatures: false
	});

	const appGenerated = await appBundle.write({
		entryFileNames: isRelease ? `${outputName}-[hash].js` : `${outputName}.js`,
		sourcemap: true,
		dir: 'src/server/static/scripts',
		format: 'es'
	});

	const mainOutput = appGenerated.output.find(({ name }) => name === outputName);
	if (!mainOutput) {
		throw new Error(`Could not find main output for bundle ${outputName}`);
	}

	const outputFiles = appGenerated.output.map(({ fileName }) => fileName);

	// Only write the resourceJS.json file for the main 'app' bundle
	if (outputName === 'app') {
		logger.log(
			`Writing resource JSON file ${kleur.blue('resourceJS.json')} to ${kleur.blue(
				'.build/resourceJS.json'
			)}`
		);
		if (!fs.existsSync(buildDir)) {
			fs.mkdirSync(buildDir);
		}
		fs.writeFileSync(
			`${buildDir}/resourceJS.json`,
			JSON.stringify({ path: `/scripts/${mainOutput.fileName}` })
		);
	}

	if (isProduction) {
		const ratio = await minifySource(outputFiles, 'src/server/static/scripts');
		logger.log(`Minified ${outputName} code is ${(ratio * 100).toFixed(2)}% of source`);
	}

	logger.success(
		`Bundled JS ${kleur.blue(mainOutput.fileName)}, total ${outputFiles.length} files`
	);
}

async function main() {
	const bundlesToBuild = [
		{ inputPath: 'src/client/app.js', outputName: 'app' }
		// Add our new download handler to the list
		// {
		// 	inputPath: 'src/client/components/pdf-error-inject/download-handler.js',
		// 	outputName: 'download-handler'
		// }
	];

	// Build all bundles in parallel
	await Promise.all(
		bundlesToBuild.map((bundle) => buildBundle(bundle.inputPath, bundle.outputName))
	);
}

// Run the main build process
main().catch((error) => {
	logger.error('Main build process failed:', error);
	process.exit(1);
});
