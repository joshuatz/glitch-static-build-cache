# Glitch-Static-Build-Cache
> Easy to use CLI command to get Glitch to re-use past builds if nothing has changed, for projects that build a static site output.

This is really just a wrapper around my other package, [static-build-cache](https://github.com/joshuatz/static-build-cache).

<!-- @TODO - add demo video / GIF? -->

## Installation
Install how you would normally install packages. If you are on Glitch, see [these instructions](https://cheatsheets.joshuatz.com/cheatsheets/cloud-services/glitch/#how-to-add-a-package).

## Usage
Usage pretty much mirrors [static-build-cache](https://github.com/joshuatz/static-build-cache). The only extra options are currently:


Option (CLI) | Option (JS) | Default | Description
--- | --- | --- | ---
`--skipDetection` | `skipDetection` | `false` | Skip is "is on glitch" detection, and always treat as if it is.
`--bailOnNonGlitch` | `bailOnNonGlitch` | `false` | If this is run outside of Glitch, would you like the program to bail with an error? If so, it will prevent chained commands from running.

## Usage Example
Package.json before using:

```json
{
	"scripts": {
		"start": "react-scripts start",
		"build": "react-scripts build",
		"test": "react-scripts test",
		"eject": "react-scripts eject"
	}
}
```

After:
```json
{
	"scripts": {
		"start": "glitch-cache && react-scripts start",
		"build": "react-scripts build",
		"test": "react-scripts test",
		"eject": "react-scripts eject"
	}
}
```

> With the above config, the same project on Glitch can be executed locally as well; on Glitch it will build and serve, but locally it will just run the next command `react-scripts start`.

## Development
 - Recommended that you use [the `prettier` VSCode extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
 - Use `yarn fix` to format code

## Change Notes
Version | Date | Notes
--- | --- | ---
v1.0.0 | 09/16/2020 | Initial Release 🚀

## Known Issues
Uptime, package re-installs, and container *resets* are a bit of a grey area with Glitch; there are some known issues and undocumented behaviors. In the case that your container experiences a *reset*, where packages are re-installed, you might find that using this tool barely reduces your startup time.

Unfortunately, in those instances, there is not much I can do to improve things, besides suggesting that you pay to upgrade to a *boosted* Glitch plan.

## About Me

 - 🔗<a href="https://joshuatz.com/" rel="noopener" target="_blank">joshuatz.com</a>
 - 💬<a href="https://twitter.com/1joshuatz" rel="noopener" target="_blank">@1joshuatz</a>
 - 💾<a href="https://github.com/joshuatz" rel="noopener" target="_blank">github.com/joshuatz</a>