#!/usr/bin/env node
const fs = require('fs')

const directory = process.cwd()
const packageJSONPath = `${directory}/package.json`

function collectModulesNames(moduleName, properties) {
  properties.forEach((property, index) => {
    if (!property) {
      return console.log([
        index ? '\n' : '',
        `There is no ${(index ? 'development ' : '')}dependencies`
      ].join(''))
    }

    const modulesNames = Object.keys(property).reduce((memo, dependency) => {
      const pathToDepPackageJSON = `${directory}/node_modules/${dependency}/package.json`
      const dependencyPackageJSON = require(pathToDepPackageJSON)
      const dependencyDeps = dependencyPackageJSON.dependencies

      if (!dependencyDeps) {
        return memo
      }

      const moduleVersion = dependencyDeps[moduleName]
      return moduleVersion ? memo.concat(`${dependency} => ${moduleName}: ${moduleVersion}`) : memo
    }, [])

    if (!modulesNames.length) {
      return console.log([
        index ? '\n' : '',
        `There is no ${(index ? 'development ' : '')}modules depends on ${moduleName}`
      ].join(''))
    }

    console.log((index ? '\nDevelopment ' : '') + 'Dependencies:')
    return console.log(modulesNames.join('\n'))
  })
}

function dependsOn() {
  if (!fs.existsSync(packageJSONPath)) {
    return console.warn('There is no package.json in this folder')
  }

  const [moduleName, all] = process.argv.slice(2)
  if (!moduleName) {
    return console.warn('You should pass a module name to scan')
  }

  const { dependencies, devDependencies } = require(packageJSONPath)
  if (!dependencies && !all) {
    return console.warn('Your module has no dependenices')
  }

  return collectModulesNames(
    moduleName,
    all ? [dependencies, devDependencies] : [dependencies]
  )
}

dependsOn()
