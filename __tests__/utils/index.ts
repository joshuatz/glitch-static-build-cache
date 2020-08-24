/**
 * @file this is pretty much a slimmed down version of static-build-cache's utils. Could refactor into separate NPM package or submodule for better DRY
 */
import { copyFile, mkdirp, mkdtemp, pathExists, writeFile } from 'fs-extra';
import { tmpdir } from 'os';
import { normalize } from 'path';
import treeKill from 'tree-kill';

const buildFiles = ['index.html'];
const buildFilesFixtureDir = normalize(`${__dirname}/../fixtures`);

export const createTestDir = async (): Promise<string> => {
	return await mkdtemp(normalize(`${tmpdir()}/`));
};

export const createTestProject = async (
	testDir: string,
	projectName: string,
	scripts?: Record<string, string>
) => {
	projectName = `${projectName}-${getRandStr(10)}`;

	// Avoid collision for folder to be created
	if (await pathExists(normalize(`${testDir}/${projectName}`))) {
		projectName = `${projectName}-${getRandStr(10)}`;
	}

	// Create project dir
	const projectDirPath = normalize(`${testDir}/${projectName}`);
	await mkdirp(projectDirPath);

	// Create package.json in project dir
	const packageInfo = {
		name: projectName,
		scripts: scripts || {},
	};
	const packagePath = normalize(`${projectDirPath}/package.json`);
	await writeFile(packagePath, JSON.stringify(packageInfo));

	// Copy test build files
	const buildDirPath = normalize(`${projectDirPath}/build`);
	await mkdirp(buildDirPath);
	const copyPromises = buildFiles.map((buildFileName) => {
		return copyFile(
			normalize(`${buildFilesFixtureDir}/${buildFileName}`),
			`${buildDirPath}/${buildFileName}`
		);
	});
	await Promise.all(copyPromises);

	return {
		packagePath,
		projectDirPath,
	};
};

const getRandStr = (len: number) => {
	return Array(len)
		.fill(0)
		.map(() => Math.random().toString(36).charAt(2))
		.join('');
};

export const delay = (delayMs: number): Promise<void> => {
	return new Promise((res) => setTimeout(res, delayMs));
};

export const testTreeKill = async (pid: number, signal: NodeJS.Signals = 'SIGINT') => {
	return new Promise((res, rej) => {
		treeKill(pid, signal, (err) => {
			if (err) {
				rej(err);
			} else {
				res();
			}
		});
	});
};

export const TestScripts = {
	build: 'true',
};
