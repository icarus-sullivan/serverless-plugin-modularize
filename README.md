
# serverless-plugin-modularize
Allows modularized serverless definitions to be merged into a root project. Making decoupled code more config driven and encapsulated. 

![Downloads][link-download] ![Version][link-version] ![License][link-license]

![header](https://raw.githubusercontent.com/icarus-sullivan/serverless-plugin-modularize/master/header.png)

# Installation

```sh
npm install -D serverless-plugin-modularize
```
or
```sh
yarn add -D serverless-plugin-modularize
```

# Usage

## Plugin Dependency

In your projects serverless file, add `serverless-plugin-modularize` to the list of your plugins:

```yaml
plugins:
  - serverless-plugin-modularize
```

## Custom Declaration
Add the following declaration to the custom definiton of your serverless file:

```yaml
custom:
  modularize:
    glob: 'src/**/*.module.yml' # glob pattern
```

The plugin uses glob patterns to resolve matching modularized files. For a primer on glob usage, visit [here][glob]. If no glob is provided, the plugin will not merge anything. When matches are found, the result will be **dynamically** merged into the base `serverless.yml` definition as required.

## Supported Mergeable Properties
To avoid mutating the base serverless framework, only the following properties are supported when merging. Unfortunately to help in merging, please follow the `Expected Type(s)` from the table below to avoid collisions between arrays and object. 

| Property | Expected Type |
|-----|-----|
| provider | Object |
| plugins | String[] |
| custom | Object `or` File Reference |
| functions | Object |
| resources | Object |

## Supported Module File Types
- yaml
- js
- json

## Commands
##### `modularize info`

The info command can be used to debug what each module is responsible for. In the example [here][example], running the command will produce the following:
```sh
$ npx serverless modularize info
modularize: src/goodbye/goodbye.module.yml 
 {
  "functions": {
    "goodbye": {
      "handler": "src/goodbye/index.goodbye"
    }
  }
} 

modularize: src/hello/hello.module.yml 
 {
  "functions": {
    "hello": {
      "handler": "src/hello/index.hello"
    }
  }
} 
```

##### `modularize merged`

The merged command will display what the serverless definition will look like once all the modules are merged:
```sh
$ npx serverless modularize merged
modularize: {
  "functions": {
    "goodbye": {
      "handler": "src/goodbye/index.goodbye",
      "events": [],
      "name": "modular-example-dev-goodbye"
    },
    "hello": {
      "handler": "src/hello/index.hello",
      "events": [],
      "name": "modular-example-dev-hello"
    }
  },
  "plugins": [
    "serverless-plugin-modularize"
  ],
  "custom": {
    "modularize": {
      "glob": "src/**/*.module.yml"
    }
  },
  "provider": {
    "stage": "dev",
    "variableSyntax": "\\${([ ~:a-zA-Z0-9._@'\",\\-\\/\\(\\)*?]+?)}",
    "name": "aws",
    "runtime": "nodejs10.x",
    "region": "us-east-1",
    "versionFunctions": true,
    "remoteFunctionData": null
  },
  "resources": {}
}
```

# Sample Project
A simple example can be found [here][example], showing how two lambda resource definitions can be modularized into one project. 

[link-download]: https://img.shields.io/npm/dt/serverless-plugin-modularize
[link-version]: https://img.shields.io/npm/v/serverless-plugin-modularize.svg
[link-license]: https://img.shields.io/npm/l/serverless-plugin-modularize.svg

[glob]: https://www.npmjs.com/package/glob
[example]: https://github.com/icarus-sullivan/serverless-plugin-modularize/tree/master/example
