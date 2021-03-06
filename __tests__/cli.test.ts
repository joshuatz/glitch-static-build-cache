import test from 'ava';
import { ChildProcess, execSync, spawn } from 'child_process';
import { remove } from 'fs-extra';
import { normalize } from 'path';
import { NotOnGlitchErrorMsgPatt } from '../src/constants';
import { createTestDir, createTestProject, TestScripts, testTreeKill } from './utils';

let testRunDirPath: string;

const LOCAL_BIN_PATH = normalize(`${__dirname}/../node_modules/.bin`);
const ENV_WITH_LOCAL_BIN: NodeJS.ProcessEnv = {
	...process.env,
	path: `${process.env.path};${LOCAL_BIN_PATH}`,
};
const CLI_CALL_PATH = normalize(`${__dirname}/../src/cli.ts`);
const CLI_CMD_BASE = `ts-node --transpile-only ${CLI_CALL_PATH}`;

let RUNNING_PROCS: Array<ChildProcess | undefined> = [];
const delistRunningProc = (pidToDelist: number) => {
	RUNNING_PROCS = RUNNING_PROCS.filter((proc) => proc.pid !== pidToDelist);
};

test.before(async () => {
	testRunDirPath = await createTestDir();
});

test('Does NOT run if not on Glitch, with bail on', async (t) => {
	// Scaffold
	const { projectDirPath } = await createTestProject(
		testRunDirPath,
		'no-glitch-env',
		TestScripts
	);

	// Attempt to run program, without mocking Glitch environment
	// Without using skip detection flag / override, and early bail = on, this should fail
	await t.throwsAsync(
		async () => {
			execSync(`${CLI_CMD_BASE} --bailOnNonGlitch`, {
				cwd: projectDirPath,
				env: ENV_WITH_LOCAL_BIN,
			});
		},
		{
			message: NotOnGlitchErrorMsgPatt,
		}
	);
});

test(`Does run locally, by bypassing with flag`, async (t) => {
	const TEST_PORT = 3000;
	// Scaffold
	const { projectDirPath } = await createTestProject(
		testRunDirPath,
		'flag-bypass',
		TestScripts
	);

	let spawnedProc: ChildProcess;
	t.timeout(1000 * 20, `Extra time for server to start`);
	await t.notThrowsAsync(async () => {
		spawnedProc = spawn(
			`${CLI_CMD_BASE}`,
			[`--bailOnNonGlitch`, `--skipDetection`, `--servePort`, `${TEST_PORT}`],
			{
				shell: true,
				windowsHide: true,
				detached: false,
				cwd: projectDirPath,
				env: ENV_WITH_LOCAL_BIN,
			}
		);
		RUNNING_PROCS.push(spawnedProc);

		spawnedProc.stderr.on('data', (err) => {
			throw new Error(err.toString());
		});
		spawnedProc.stdout.on('data', (data: Buffer | string | any) => {
			const strOut: string = data.toString();
			if (/serving from/gim.test(strOut)) {
				return `Server is up!`;
			}
		});
	});

	await testTreeKill(spawnedProc.pid);
	delistRunningProc(spawnedProc.pid);
});

test(`Does run on Glitch, by detecting environment`, async (t) => {
	const TEST_PORT = 3001;
	// Scaffold
	const { projectDirPath } = await createTestProject(
		testRunDirPath,
		'env-bypass',
		TestScripts
	);

	let spawnedProc: ChildProcess;
	t.timeout(1000 * 20, `Extra time for server to start`);
	await t.notThrowsAsync(async () => {
		spawnedProc = spawn(
			`${CLI_CMD_BASE}`,
			[`--bailOnNonGlitch`, `--servePort`, `${TEST_PORT}`],
			{
				shell: true,
				windowsHide: true,
				detached: false,
				cwd: projectDirPath,
				env: {
					...ENV_WITH_LOCAL_BIN,
					API_SERVER_EXTERNAL: 'https://api.glitch.com',
				},
			}
		);
		RUNNING_PROCS.push(spawnedProc);

		spawnedProc.stderr.on('data', (err) => {
			throw new Error(err.toString());
		});
		spawnedProc.stdout.on('data', (data) => {
			const strOut: string = data.toString();
			if (/serving from/gim.test(strOut)) {
				return `Server is up!`;
			}
		});
	});

	await testTreeKill(spawnedProc.pid);
	delistRunningProc(spawnedProc.pid);
});

test.after.always(async () => {
	// Try to shut down to avoid conflicts
	await Promise.all(
		RUNNING_PROCS.map((proc) => {
			if (proc && !proc.killed) {
				try {
					testTreeKill(proc.pid);
				} catch (e) {
					console.log(`Warning: failed to tree-kill ${proc.pid}`, e);
				}
				return;
			} else {
				return;
			}
		})
	);
	await remove(testRunDirPath);
});
