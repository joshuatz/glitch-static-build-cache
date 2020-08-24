#!/usr/bin/env node
import { getProgram } from 'static-build-cache';
import { CacheFileName, NotOnGlitchErrorMsg } from './constants';
import { main } from './index';
import { MainConfig } from './types';
import detectIsOnGlitch = require('detect-is-on-glitch');
// @ts-ignore
const packageInfo: PackageInfo = require('../package.json');

type PackageInfo = {
	name: string;
	version: string;
};

const cli = async () => {
	const program = getProgram();

	// Program is commander instance from static-build-cache
	// Inject our wrapper options and override meta info
	program
		.version(packageInfo.version)
		.name(packageInfo.name)
		.option(`--skipDetection`, `Skip "is on glitch" detection`);
	program.parse(process.argv);

	// Glitch detection
	const isOnGlitch = await detectIsOnGlitch();
	if (program.skipDetection !== true && !isOnGlitch) {
		// Bail early, and allow chained commands to execute!
		if (!program.silent) {
			console.error(NotOnGlitchErrorMsg);
		}
		process.exit(1);
	} else {
		const inputConfig: MainConfig = {
			projectRoot: program.projectRoot,
			buildDir: program.buildDir,
			buildCmd: program.buildCmd,
			serveCmd: program.serveCmd,
			servePort: parseInt(program.port, 10),
			useGit: program.useGit,
			cacheFileName: program.cacheFileName || CacheFileName,
			silent: program.silent,
			// Skip detection should be true, since detection already happens above
			// Option is still in main for those calling via JS
			skipDetection: true,
		};
		await main(inputConfig);
		return;
	}
};

// If called directly
if (require.main === module) {
	cli();
}
