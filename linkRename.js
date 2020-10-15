#!/usr/bin/env node

const path = require('path'), fs=require('fs')

const source = 'solid.community'
const target = 'solidcommunity.net'
const exts = ['acl', 'meta', 'ttl']
const commands = ['run', 'test', 'help']
const params = ['--no', '--folder', '--file']

// usage represents the help guide
const usage = function() {
  const usageText = `
  linkRename.js rename links in text/turtle files filtered by extension.

  usage:
    ./linkRename.js <command> [ext=[<extension>]] [<parameter>] [<folder>]

    <command> can be :

    run:      used to run rename "${source}" to "${target}"
    test:     used to make a blank test
    help:     used to print the usage guide

    <extension> can be : (example ext=acl)
    acl, meta or ttl   only one, default is all

    <parameter> can be (optional) :

    --file    default, used to list all files to rename
    --folder  list first level folder where a rename may occur
    --no      do not list anything

    <folder> : where to begin recursive rename (server, pod, any podFolder)
  `

  console.log(usageText)
}

// test arguments

// test commands
const args = process.argv.filter(item => !(item.startsWith('--') || item.startsWith('ext=')))
if (!(args.length === 3 || args.length === 4)) {
  console.log(`incorrect number of arguments`)
  usage()
  return
}
const command = args[2]
if (commands.indexOf(command) == -1) {
  console.log('invalid command passed')
  usage()
  return
}

// test parameterss
const parms = process.argv.filter(item => item.startsWith('--'))
let param = parms[0]
if (!param) param ='--file'
if (params.indexOf(param) == -1) {
  console.log('invalid parameter passed')
  usage()
  return
}

// test extensions
let ext = process.argv.filter(item => item.startsWith('ext='))
if (ext && ext[0]) {
  ext[0] = ext[0].replace('ext=', '')
  if (exts.indexOf(ext[0]) == -1) {
    console.log('invalid extension passed')
    usage()
    return
  }  
}
else ext = exts
console.log('extention ' + ext)
const pattExt = ext.map(ext => new RegExp(`\.${ext}$`))
console.log(pattExt)

// main
switch(command) {
  case 'help':
    usage()
    break
  case 'test':
  case 'run':
    // test folder
    if (!args[3]) { console.log('path is missing'); break }
    if (args[3].endsWith('/')) { console.log('folder shall not end with "/"'); break }
    const pathToServer = args[3]
    let count = [0, 0, 0]
    let title = ''
    console.log('on folder : ' + pathToServer)

    // rename for each extension
    for (const i in pattExt) {
      console.log('\n' + command + ' extension .' + ext[i])
      fromDir(pathToServer,pattExt[i],function(filename) {
        const content = fs.readFileSync(filename).toString()
        const patt = new RegExp(source)
        if (patt.test(content)) {
          const newContent = rename(content, source, target) //content.replace(new RegExp(source, 'g'), target)
          if (param !== '--no') {
            const name = filename.split(pathToServer)[1]
            const test = name.split('/')
            if (test.length > 1) {
              if (title !== test[1]) {
                title = test[1]
                console.log('  ' + title)
              }
            }
            if (param === '--file') console.log('   ' + name.split(title)[1])
          }
          count[i] += 1
          if (command === 'run') fs.writeFileSync(filename, newContent)
        }
      })
    }
    for (const i in pattExt) {
      console.log(`\nFound ${count[i]} "${ext[i]}" with strings to rename`)
    }
    console.log('\n"All strings may not be renamed. All links are renamed"')
  break
default:
  console.log('invalid command passed')
  usage()
}

// parse recursively all files matching filter and apply callback
function fromDir(startPath,filter,callback) {
  if (!fs.existsSync(startPath)) {
      console.log("no dir ",startPath)
      return
  }

  var files=fs.readdirSync(startPath)
  for (var i=0;i<files.length;i++) {
      var filename=path.join(startPath,files[i])
      var stat = fs.lstatSync(filename)
      if (stat.isDirectory()) { // && !filename.startsWith(target)) {
          fromDir(filename,filter,callback) //recurse
      }
      else if (filter.test(filename)) callback(filename)
  }
}

// only replace server links
function rename (content, source, target) {
  sourceArray = content.split('<')
  for (const i in sourceArray) {
    const link = sourceArray[i].split('>')
    
    // this is may be too strict and could be tested against
    // link[0] = link[0].replace(new RegExp(source, 'g'), target)
    
    if (link[0].startsWith('https://')) {
      let linkSplit = link[0].split('/')
      let podName = linkSplit[2]
      linkSplit[2] = podName.replace(new RegExp(`${source}$`), target)
      link[0] = linkSplit.join('/')
    }
    sourceArray[i] = link.join('>')
  }
  const newContent = sourceArray.join('<')
  return newContent
}