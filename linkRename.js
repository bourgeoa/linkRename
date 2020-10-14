#!/usr/bin/env node

const path = require('path'), fs=require('fs')

const source = 'solid.community'
const target = 'solidcommunity.net'
const ext = ['acl', 'meta', 'ttl']
const pattExt = ext.map(ext => new RegExp(`\.${ext}$`))
let count = [0, 0, 0]
console.log(pattExt)
const args = process.argv
const commands = ['run', 'test', 'help']

// usage represents the help guide
const usage = function() {
  const usageText = `
  index.js rename links in acl files.

  usage:
    index.js <command> <folder>

    commands can be:

    run:      used to run rename "${source}" to "${target}"
    test:     used to make a blank test
    help:     used to print the usage guide
  `

  console.log(usageText)
}

// test arguments
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

// main
switch(command) {
  case 'help':
    usage()
    break
  case 'test':
  case 'run':
    if (!args[3]) { console.log('path is missing'); break }
    if (args[3].endsWith('/')) { console.log('folder shall not end with "/"'); break }
    const pathToServer = args[3]

    for (const i in pattExt) {
      console.log('\n' + command + ' extension .' + ext[i])
      console.log('on folder : ' + pathToServer + '\n')
      fromDir(pathToServer,pattExt[i],function(filename) {
        const content = fs.readFileSync(filename).toString()
        const patt = new RegExp(source)
        if (patt.test(content)) {
          const newContent = rename(content, source, target) //content.replace(new RegExp(source, 'g'), target)
          console.log(filename.split(pathToServer)[1])
          count[i] += 1
          if (command === 'run') fs.writeFileSync(filename, newContent)
        }
      })
    }
    for (const i in pattExt) {
      console.log(`\nFound ${count[i]} "${ext[i]}" with links to rename`)
    }
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
      let pod = linkSplit[2]
      linkSplit[2] = pod.replace(source, target)
      link[0] = linkSplit.join('/')
    }
    sourceArray[i] = link.join('>')
  }
  const newContent = sourceArray.join('<')
  return newContent
}