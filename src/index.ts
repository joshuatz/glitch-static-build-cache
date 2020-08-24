import detectIsOnGlitch from 'detect-is-on-glitch';
import { main as sbcMain } from 'static-build-cache';
import { NotOnGlitchErrorMsg } from './constants';
import { MainConfig } from './types';

export async function main(config: MainConfig) {
	// Glitch Detection
	/* istanbul ignore else */
	if (!config.skipDetection) {
		/* istanbul ignore next */
		const isOnGlitch = await detectIsOnGlitch();
		/* istanbul ignore next */
		if (!isOnGlitch) {
			throw new Error(NotOnGlitchErrorMsg);
		}
	}

	// Pass to static-build-cache module
	delete config.skipDetection;
	return await sbcMain(config);
}

export default main;
