const tmenu        = require('terminal-menu')
    , path         = require('path')
    , fs           = require('fs')
    , xtend        = require('xtend')
    , EventEmitter = require('events').EventEmitter
    , chalk        = require('chalk')
    , vw           = require('visualwidth')

const util         = require('./util')


function showMenu (opts, i18n) {

  var emitter         = new EventEmitter()
    , menu            = tmenu(xtend({
          width : opts.width
        , x     : 3
        , y     : 2
      }, opts.menu))
    , __              = i18n.__
    , __n             = i18n.__n

  menu.reset()
  menu.write(chalk.bold(__('title')) + '\n')
  //if (typeof i18n.has('subtitle') == 'string') <-- TODO
    menu.write(chalk.italic(__('subtitle')) + '\n')
  menu.write(util.repeat('\u2500', opts.width) + '\n')

  function emit(event, value) {
    return process.nextTick.bind(process, emitter.emit.bind(emitter, event, value))
  }
    
  opts.languages.forEach(function (lang) {
    var name   = __("language." + lang)
      , entry  = chalk.bold('»') + ' ' + name
      , marker = (opts.lang === lang) ? '[' + __('language._current')  + ']' : ''
      , empty  = opts.width - vw.width(entry) - 2 - vw.width(marker)

    if (empty < 0) {
      entry = entry.substr(0, entry.length + empty - 1) + "..."
      empty = 0
    }

    menu.add(entry + util.repeat(' ', empty) + marker, emit('select', lang))
  })

  menu.write(util.repeat('\u2500', opts.width) + '\n')
  menu.add(chalk.bold(__('menu.cancel')), emit('cancel'))
  menu.add(chalk.bold(__('menu.exit')), emit('exit'))

  function regexpEncode(str) {
    return str.replace(/([\.\*\+\?\{\}\[\]\- \(\)\|\^\$\\])/g, "\\$1")
  }

  menu.on('select', function (label) {
    menu.y = 0
    menu.reset()
    menu.close()
  })

  menu.createStream().pipe(process.stdout)
  
  return emitter
}


module.exports = showMenu