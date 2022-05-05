import { join as pathJoin } from 'path'
import { fileURLToPath } from 'url'
import dirFiles from 'dir-files'
import { openDirArrayPromise } from '@arijs/frontend/server/utils/open-dir'
import {
	tryOpenReadPromise,
	tryReadStreamEnd,
	tryOpenWritePromise,
	tryWriteStreamEnd,
} from '@arijs/frontend/server/utils/streams'
import {
	parseJsx,
	targets,
} from '@builder.io/mitosis'

const reDirSep = /[\\\/]+/g
const fileOpt = { encoding: 'utf8' }

const dirBase = fileURLToPath(new URL('../src', import.meta.url)).replace(/\/+$/,'')
const dirInput = pathJoin(dirBase, 'mitosis')
const generators = createGenerators({
	react: {
		// stylesType?: 'emotion' | 'styled-components' | 'styled-jsx' | 'react-native';
		stylesType: 'styled-jsx',
		// stateType?: 'useState' | 'mobx' | 'valtio' | 'solid' | 'builder';
		stateType: 'useState',
		// format?: 'lite' | 'safe';
		format: 'lite',
		// type?: 'dom' | 'native';
		type: 'dom',
	},
	vue: {},
	solid: {},
	svelte: {},
})

findSourceFiles(dirInput, fnProcessItemOutput(generators)).then(finished => {
	console.log(`${finished.length} file(s) processed`)
	// finished.forEach(({dir: { sub }, name}) => console.log(pathJoin(sub, name)))
})

function createGenerators(config) {
	return Object.entries(config).map(([format, formatConfig]) => {
		const generator = targets[format](formatConfig)
		return { format, generator }
	})
}

function findSourceFiles(srcPath, processItem) {
	return new Promise((resolve, reject) => {
		var dfp = dirFiles.plugins;
		var pluginOpt = {};

		dirFiles({
			result: [],
			path: srcPath,
			plugins: [
				dfp.skip(function skipSpecial(file) {
					var name = file.name;
					// example of manual skipping
					var skip = name.startsWith('.') ||
						name.startsWith('$') ||
						name.startsWith('node_modules');
					return skip;
				}),
				dfp.stat(pluginOpt),
				dfp.queueDir(pluginOpt),
				dfp.readDir(pluginOpt),
				dfp.queueDirFiles(pluginOpt),
				dfp.skip(function skipEmptyNameOrDir(file) {
					return !file.name || file.stat.isDirectory();
				}),
				function (file) {
					this.result.push(processItem(file).then(() => file))
				}
			],
			callback: function(err, promises) {
				return err
					? reject(err)
					: resolve(Promise.all(promises));
			}
		});
	});
}

function fnProcessItemOutput(generators) {
	return async function processItem(file) {
		const component = await readMitosisFromFile(file)
		await Promise.all(generators.map(gen =>
			writeFormatToFile(file, gen, component)
		))
	}
}

async function readMitosisFromFile({dir: {root, sub}, name}) {
	console.error(pathJoin(sub, name))
	const readStream = await tryOpenReadPromise(pathJoin(root, sub, name), fileOpt)
	let data = ''
	readStream.on('data', (chunk) => data += chunk)
	await tryReadStreamEnd(readStream)
	return parseJsx(data)
}

async function writeFormatToFile({dir: {sub}, name}, { format, generator }, component) {
	// console.error(`  ->`, format)
	const dirSub = pathJoin(format, sub)
	await openDirArrayPromise(dirBase, dirSub.split(reDirSep))
	const outputPath = pathJoin(dirBase, dirSub, replaceExt(name, format))
	const output = generator({
		component,
		path: outputPath
	})
	const writeStream = await tryOpenWritePromise(outputPath, fileOpt)
	await tryWriteStreamEnd(writeStream, output)
}

const reExt = /(\.lite)?(\.\w+)?$/i
function replaceExt(name, target) {
	switch (target) {
		case 'svelte': return name.replace(reExt, '.svelte')
		case 'vue': return name.replace(reExt, '.vue')
		default: return name.replace(reExt, '.jsx')
	}
}
