#!/usr/bin/env node

'use strict'

const fsExtra = require('fs-extra')
const {
    join,
    basename
} = require('path')
const panic = require('../lib/panic')

const workingDirectory = process.cwd()

// assets.json must be present in the working directory
const assetsJsonPath = join(workingDirectory, 'assets.json')

if (!fsExtra.existsSync(assetsJsonPath)) {
    panic('assets.json not found')
}

//////////////////////////////////////////////////////////////////
const assets = require(assetsJsonPath)
const globalOutDir = assets.outDir

if (!('assetsTypes' in assets)) {
    panic('You need to provide "assetsTypes" entry')
}

if ('directories' in assets) {
    for (const directory of assets.directories) {
        const assetsRoot = join(workingDirectory, directory.path)

        for (const assetModule of directory.modules) {
            const relativeOutDir = assetModule.outDir || globalOutDir
            const outDir = join(workingDirectory, relativeOutDir)

            if (outDir == undefined) {
                panic('No output directory specified')
            }

            const moduleDir = join(assetsRoot, assetModule.path)

            for (const assetsType of assets.assetsTypes) {
                if (assetModule[assetsType] != undefined) {
                    for (const file of assetModule[assetsType]) {
                        const inputFilePath = join(moduleDir, file)
                        const outputFileDirectory = join(outDir, assetsType)
                        const outputFilePath = join(outputFileDirectory, basename(file))

                        if (!fsExtra.pathExistsSync(outputFileDirectory)) {
                            fsExtra.mkdirpSync(outputFileDirectory)
                        }

                        console.log(`${inputFilePath} \n\t -> ${outputFilePath}`)
                        fsExtra.copySync(inputFilePath, outputFilePath)
                    }
                }
            }
        }
    }

    console.log('Assets copied')
} else {
    panic('"directories" entry needed at the top of assets.json')
}