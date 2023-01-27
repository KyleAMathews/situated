import { nodeFileTrace } from '@vercel/nft'
import fs from 'fs-extra'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

async function main() {
  // TODO get file from cli
  const argv = yargs(hideBin(process.argv)).argv
  console.log({ argv })
  if (!argv.file) {
    console.log(`path to file is required e.g. --file=super/duper.js`)
    process.exit(1)
  }
  if (!argv.outDir) {
    console.log(`path to outDir is required e.g. --outDir=super/out`)
    process.exit(1)
  }
  if (!argv.rootDir) {
    console.log(`path to rootDir is required e.g. --rootDir=super`)
    process.exit(1)
  }
  const pathToFile = path.join(process.cwd(), argv.file)
  const outDir = path.join(process.cwd(), argv.outDir)
  const rootDir = path.join(process.cwd(), argv.rootDir)
  // process.chdir(rootDir)
  console.log({ pathToFile, outDir })

  const files = [pathToFile]
  const { fileList, reasons } = await nodeFileTrace(files)
  fileList.add(`node_modules/steno`)

  fs.mkdirpSync(outDir)
  fs.writeFileSync(
    path.join(outDir, `nft-filelist.json`),
    JSON.stringify({ fileList: [...fileList], reasons: [...reasons] }, null, 4),
  )

  // To copy a folder or file, select overwrite accordingly
  fileList.forEach((srcDirFile) => {
    const outDest = path.join(outDir, srcDirFile)
    try {
      fs.copySync(srcDirFile, outDest, {
        overwrite: true,
        dereference: true,
      })
      console.log(`success!`, { srcDirFile, outDest })
    } catch (err) {
      console.error(err)
      console.log(`failure!!`, { srcDirFile, outDest })
    }
  })
}
main()
