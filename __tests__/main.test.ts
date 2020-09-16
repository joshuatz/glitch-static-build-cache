import test from 'ava';
import { main } from '../src';
import { UnpackedPromise } from '../src/types';
import { createTestDir, createTestProject, TestScripts } from './utils';

let testRunDirPath: string;
test.before(async () => {
	testRunDirPath = await createTestDir();
});

test(`Tests import of main`, async (t) => {
	const TEST_PORT = 3002;

	// Scaffold
	const { projectDirPath } = await createTestProject(
		testRunDirPath,
		'main-import',
		TestScripts
	);

	let runner: UnpackedPromise<ReturnType<typeof main>>;
	await t.notThrowsAsync(async () => {
		runner = await main({
			projectRoot: projectDirPath,
			skipDetection: true,
			servePort: TEST_PORT,
		});
	});
	t.true(typeof runner.forceStop === 'function');

	// Shutdown
	await t.notThrowsAsync(async () => {
		await runner.forceStop();
	});
});
