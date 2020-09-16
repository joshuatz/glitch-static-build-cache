import { MinConfig } from 'static-build-cache';

export type MainConfig = MinConfig & {
	skipDetection?: boolean;
	bailOnNonGlitch?: boolean;
};

export type UnpackedPromise<T> = T extends Promise<infer U> ? U : T;
