module.exports = function TrueBravelyPotion(mod) {
  mod.command.add('tbp', () => {
    mod.settings.enabled = !mod.settings.enabled
    mod.command.message(mod.settings.enabled ? 'enabled' : 'disabled')
  })

  let abnormalities = {}
  mod.hook('S_ABNORMALITY_BEGIN', 3, event => {
    if (mod.game.me.is(event.target))
      abnormalities[event.id] = Date.now() + event.duration
  })

  mod.hook('S_ABNORMALITY_REFRESH', 1, event => {
    if (mod.game.me.is(event.target))
      abnormalities[event.id] = Date.now() + event.duration
  })

  mod.hook('S_ABNORMALITY_END', 1, event => {
    if (mod.game.me.is(event.target))
      delete abnormalities[event.id]
  })

  function abnormalityDuration(id) {
    if (!abnormalities[id])
      return 0
    return abnormalities[id] - Date.now()
  }

  let items = []
  mod.hook('S_INVEN', 17, event => {
    items = event.first ? event.items : items.concat(event.items)
  })

  function useBravery() {
    if (!mod.settings.enabled || !mod.game.isIngame || mod.game.isInLoadingScreen || !mod.game.me.alive || mod.game.me.mounted || mod.game.me.inBattleground || !mod.game.me.inCombat)
      return

    for (const buff of [4830, 4831, 4833]) {
      if (abnormalityDuration(buff) > 60 * 1000)
        return
    }

    let id
    for (const itemId of [444, 81179, 202015, 100260, 117529, 117533, 139536, 117530, 117534]) {
      if (items.find(item => item.id === itemId))
        id = itemId
    }

    if (id)
      mod.send('C_USE_ITEM', 3, { gameId: mod.game.me.gameId, id })
  }

  let interval
  function start() {
    stop()
    interval = mod.setInterval(useBravery, 1000)
  }

  function stop() {
    if (interval) {
      mod.clearInterval(interval)
      interval = null
    }
  }

  mod.game.on('enter_game', start)
  mod.game.on('leave_game', () => {
    abnormalities = {}
    stop()
  })

  mod.game.me.on('resurrect', () => {
    abnormalities = {}
    start()
  })
}