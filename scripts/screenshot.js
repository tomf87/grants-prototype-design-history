/*
 * STEP 1
 * Set `domain` to the website you want to screenshot, eg localhost:3000
 */
const domain = 'http://localhost:3000'

/*
 * STEP 2
 * Set `paths` to an array of named paths, for example:
 *
 * [
 *   { title: 'Index page', path: '/'},
 *   { title: 'Terms and conditions', path: '/terms-conditions'}
 * ]
 */
const paths = [
  { title: 'Guidance page all', path: '/current/views/guidance/all-grants' },
  { title: 'Guidance page water', path: '/current/views/guidance/large-water' },
  { title: 'Guidance page slurry', path: '/current/views/guidance/large-slurry' },

  { title: 'V1 start page', path: '/v2/views/start' },
  { title: 'V2 start page water', path: '/current/views/water/start' },
  { title: 'v2 start page slurry', path: '/current/views/slurry/start' },

  { title: 'V1 farming type', path: '/v2/views/farming-type' },
  { title: 'V1 farming type fail', path: '/v2/views/farming-type-fail' },
  { title: 'V2 farming type water', path: '/current/views/water/farming-type' },
  { title: 'V2 farming type water fail', path: '/current/views/water/farming-type-fail' },
  { title: 'v2 farming type slurry', path: '/current/views/slurry/farming-type' },
  { title: 'v2 farming type slurry fail', path: '/current/views/slurry/farming-type-fail' },

  { title: 'V1 country', path: '/v2/views/country' },
  { title: 'V1 country fail', path: '/v2/views/country-fail' },
  { title: 'V2 country water', path: '/current/views/water/country' },
  { title: 'V2 country water fail', path: '/current/views/water/country-fail' },
  { title: 'v2 country slurry', path: '/current/views/slurry/country' },
  { title: 'v2 country slurry fail', path: '/current/views/slurry/country-fail' }
]

/*
 * STEP 3
 * Run: node scripts/screenshot.js [name-of-directory], for example:
 *
 * node scripts/screenshot.js apply-for-teacher-training/name-of-directory
 */

// Dependencies
const { DateTime } = require('luxon')
const webshot = require('webshot-node')
const fs = require('fs')

// Arguments
const directoryName = process.argv.slice(-1)[0]
warnIfNoArguments()

const deepestDirectory = directoryName.split('/').pop()

var title = deepestDirectory.replace(/-/g, ' ')
title = title.charAt(0).toUpperCase() + title.slice(1)

const datestamp = DateTime.local().toFormat('yyyy-MM-dd')

const imageDirectory = `app/images/${directoryName}`
const postDirectory = `app/posts/${directoryName}`.replace('/' + deepestDirectory, '')

// Run
function start () {
  makeDirectories()
  decoratePaths()
  generatePage()
  takeScreenshots()
}

function warnIfNoArguments (title) {
  // TODO: Use a better check for an argument
  if (directoryName.startsWith('/Users')) {
    console.log('No arguments set')
    console.log('Please set a directory name: `node scripts/screenshot.js "name-of-directory"`')
  }
}

function makeDirectories () {
  if (!fs.existsSync(imageDirectory)) {
    fs.mkdirSync(imageDirectory)
  }

  if (!fs.existsSync(postDirectory)) {
    fs.mkdirSync(postDirectory)
  }
}

function decoratePaths () {
  paths.forEach(function (item, index) {
    item.id = item.title.replace(/ +/g, '-').toLowerCase()
    item.file = `${imageDirectory}/${item.id}.png`
    item.src = item.file.replace('app/assets', '/public')
  })
}

function takeScreenshots () {
  // https://github.com/brenden/node-webshot
  const webshotOptions = {
    phantomConfig: {
      'ignore-ssl-errors': 'true'
    },
    windowSize: {
      width: 1200,
      height: 800
    },
    shotSize: {
      width: 'window',
      height: 'all'
    }
  }

  paths.forEach(function (item, index) {
    webshot(
      domain + item.path,
      item.file,
      webshotOptions,
      function () {
        console.error(`${domain + item.path} \n >> ${item.file}`)
      }
    )
  })
}

function generatePage () {
  var template = ''
  const templateStart = `---
title: ${title}
description:
date: ${datestamp}
---
{% from "screenshots/macro.njk" import appScreenshots with context %}
{{ appScreenshots({
  items: [`

  const templateEnd = `
  ]
}) }}
`

  paths.forEach(function (item, index) {
    template += `${index > 0 ? ', ' : ''}
    {
      text: "${item.title}"
    }`
  })

  const filename = `${postDirectory}/${datestamp}-${deepestDirectory}.md`

  fs.writeFile(
    filename,
    templateStart + template + templateEnd,
    function (err) {
      if (err) {
        console.error(err)
      }
      console.log(`Page generated: ${filename}`)
    }
  )
}

start()
