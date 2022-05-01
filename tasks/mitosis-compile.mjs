import { join as pathJoin } from 'path';
import { fileURLToPath } from 'url';
import dirFiles from 'dir-files';
import { openDirArrayPromise } from '@arijs/frontend/server/utils/open-dir';
import {
	tryOpenReadPromise,
	tryReadStreamEnd,
	tryOpenWritePromise,
	tryWriteStreamEnd,
} from '@arijs/frontend/server/utils/streams'
import {
	parseJsx,
	targets,
} from '@builder.io/mitosis';

const reDirSep = /[\\\/]+/g;

const dirBase = fileURLToPath(new URL('../src', import.meta.url)).replace(/\/+$/,'');
const dirInput = pathJoin(dirBase, 'mitosis')

findSourceFiles(dirInput, fnProcessItemOutput({
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
})).then(finished => {
	console.log(`${finished.length} file(s) processed`)
	finished.forEach(({dir: { sub }, name}) => console.log(pathJoin(sub, name)))
})

function findSourceFiles(srcPath, processItem) {
	return new Promise((resolve, reject) => {
		var dfp = dirFiles.plugins;
		var pluginOpt = {};

		dirFiles({
			result: {
				promises: [],
				finished: [],
			},
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
					// console.log('~ '+pathJoin(file.dir.sub, file.name));
					const { promises, finished } = this.result
					const prom = processItem(file)
					promises.push(prom)
					prom.then(() => finished.push(file))
				}
			],
			callback: function(err, { promises, finished }) {
				return err
					? reject(err)
					: resolve(Promise.all(promises).then(() => finished));
			}
		});
	});
}

const fileOpt = { encoding: 'utf8' }
function fnProcessItemOutput(config) {
	return async function processItem({dir: {root, sub}, name}) {
		console.error(`-> will compile:`, [sub, name])
		const readStream = await tryOpenReadPromise(pathJoin(root, sub, name), fileOpt)
		let data = ''
		readStream.on('data', (chunk) => data += chunk)
		await tryReadStreamEnd(readStream)
		const component = parseJsx(data)
		await Promise.all(Object.entries(config).map(async ([k, v]) => {
			console.error(`  -> write`, [k])
			const dirSub = pathJoin(k, sub)
			// console.error(`  ->   dirSub`, [dirSub])
			await openDirArrayPromise(dirBase, dirSub.split(reDirSep))
			const generator = targets[k]
			const outputPath = pathJoin(dirBase, dirSub, replaceExt(name, k))
			const output = generator(v)({
				component,
				path: outputPath
			})
			const writeStream = await tryOpenWritePromise(outputPath, fileOpt)
			await tryWriteStreamEnd(writeStream, output)
		}))
	}
}

const reExt = /(\.lite)?(\.\w+)?$/i
function replaceExt(name, target) {
	switch (target) {
		case 'svelte': return name.replace(reExt, '.svelte')
		case 'vue': return name.replace(reExt, '.vue')
		default: return name.replace(reExt, '.jsx')
	}
}
