import Contracts from '@/Contracts'

class Game {
  constructor () {

    this.cfg = {
      ctx: null,
      x: 0,
      y: 0,
      width: 900,
      height: 900,
      virusBorderY: 900
    }

    this.hero = null
    this.monsters = null

    this.hitScore = 0
    this.hitScoreInterval = 1
    this.gameMode = null

    // timer
    this.introTimer = null
    this.endingTimer = null
    this.demoTimer = null

  }

  // resize (width, height) {
  //   this.width = width
  //   this.height = height
  // }

  initGame () {
    // this.cfg.virusBorderY = Math.floor(this.height * 0.8)
    const { height } = this.cfg
    const virusBorderY = Math.floor(height * 0.8)
    // console.log({ 'initGame': height, virusBorderY })
    this.cfg = {
      ...this.cfg,
      virusBorderY
    }
    this.hitScore = 0
    if (this.hero) {
      this.hero.reset()
    }

    this.introTimer = null
    this.endingTimer = null
    this.demoTimer = null
  }

  setHero (hero) {
    this.hero = hero
    return this
  }

  setMonsters (monsters) {
    this.monsters = monsters
    return this
  }

  clearScreen (ctx, width, height) {
    ctx.clearRect(0, 0, width, height)
    ctx.beginPath()
  }

  drawCleanZone (ctx, y) {
    const { width } = this.cfg
    // console.log('drawCleanZone:', { width, y })
    ctx.fillStyle = Contracts.COLOR_CLEAN_ZONE
    ctx.fillRect(0, 0, width, y)
  }

  drawPollutionZone (ctx, y) {
    const { width, height } = this.cfg
    ctx.fillStyle = Contracts.COLOR_POLLUTION_ZONE
    // console.log('drawPollutionZone:', { y, width, height })
    ctx.fillRect(0, y, width, height)
  }

  showDemoInfo (ctx, width, height, timestamp) {
    if (!this.demoMode) return

    if (this.demoTimer === null) {
      this.demoTimer = {
        diff: timestamp - (new Date(timestamp)).getSeconds()
      }
    }
    const { diff } = this.demoTimer
    const seconds = (new Date(timestamp - diff)).getSeconds()

    if (seconds % 2 === 0) {
      let fontSize = 36

      if (width < 1024) {
        fontSize = 32
      }
      const gameInfoText = `Press "S" to play...`
      const x = Math.floor(width) * 0.5 - ctx.measureText(gameInfoText).width / 2
      const y = height
      ctx.font = `bold ${fontSize}px ${Contracts.FONT_GAME_INFO}`
      ctx.fillStyle = `${Contracts.COLOR_GAME_INFO}`
      ctx.fillText(gameInfoText, x, y / 2)
    }
  }

  showGameInfo (ctx, virusBorderY) {
    const { width, height } = this.cfg

    if (!this.hero) {
      throw new Error('hero not set')
    }

    const virusPollutionDegree = Math.floor((height - virusBorderY) / height * 100)
    // console.log('virusPollutionDegree', virusPollutionDegree, virusBorderY, this.height)
    const crewSaved = this.hero.text.length - 1

    const damageText = `${this.hero.damage}/${this.hero.maxDamage}`
    const hitScoreText = `${this.hitScore}`.padStart(5, '0')
    const gameInfoText = `POLLUTION: ${virusPollutionDegree}/100 DAMAGE: ${damageText} SCORE: ${hitScoreText} CREW: ${crewSaved}/4`

    let fontSize = 36
    let lineHeightInterval = 36

    if (width < 1024) {
      fontSize = 32
      lineHeightInterval = 32
    }

    ctx.font = `bold ${fontSize}px ${Contracts.FONT_GAME_INFO}`
    ctx.fillStyle = `${Contracts.COLOR_GAME_INFO}`

    const x = Math.floor(width) * 0.5 - ctx.measureText(gameInfoText).width / 2
    const y = Math.floor(height) * 0.1

    ctx.fillText(gameInfoText, x, y)
  }

  showGameIntro ({ ctx, virusBorderY, timestamp, progress, frameSeq }) {
    const { width, height } = this.cfg

    if (this.introTimer === null) {
      this.introTimer = {
        diff: timestamp - (new Date(timestamp)).getSeconds(),
        timer: 7
      }
    }
    const { diff, timer } = this.introTimer
    const seconds = timer - (new Date(timestamp - diff)).getSeconds()

    if (seconds <= 0) {
      return this.startDemo()
    }

    const introTexts = Contracts.INTRO_TEXT
      .replace('##SEC##', `${seconds}`)
      .split('\n')

    let fontSize = 36
    let lineHeightInterval = 36

    if (width < 1024) {
      fontSize = 32
      lineHeightInterval = 32
    }

    ctx.font = `bold ${fontSize}px ${Contracts.FONT_GAME_INFO}`
    ctx.fillStyle = `${Contracts.COLOR_GAME_INFO}`

    let lineHeight = lineHeightInterval
    for (let introText of introTexts) {
      const x = Math.floor(width) * 0.5 - ctx.measureText(introText).width / 2
      const y = Math.floor(height) * 0.1

      ctx.fillText(introText, x, y + lineHeight)
      lineHeight += lineHeightInterval
    }

  }

  showGameEnding ({ ctx, timestamp }) {
    this.demoMode = false
    const { width, height } = this.cfg

    if (this.introTimer === null) {
      this.introTimer = {
        diff: timestamp - (new Date(timestamp)).getSeconds(),
        timer: 7
      }
    }
    const { diff, timer } = this.introTimer
    const seconds = timer - (new Date(timestamp - diff)).getSeconds()

    if (seconds <= 0) {
      return this.gameMode = Contracts.INTRO_THE_GAME
    }

    let font = Contracts.FONT_LOSE_GAME
    let color = Contracts.COLOR_LOSE_GAME
    let gameModeText = 'Game Over'

    if (this.gameMode === Contracts.WON_THE_GAME) {
      font = Contracts.FONT_WON_GAME
      color = Contracts.COLOR_WON_GAME
      gameModeText = 'You Won!'
    }

    const pressToStartText = 'Press "S" to Start'

    ctx.font = `bold 96px ${font}`
    ctx.fillStyle = `${color}`

    const x = Math.floor(width) * 0.5 - ctx.measureText(gameModeText).width / 2
    const y = Math.floor(height) * 0.5

    ctx.fillText(gameModeText, x, y)

    ctx.font = `bold 36px ${font}`
    ctx.fillText(pressToStartText, x, y + 96)

    ctx.font = `24px ${font}`
    ctx.fillText(`Continue to after ${seconds} second${seconds !== 1 ? 's' : ''}`, x, y + 140)

  }

  increasePollutedArea (increaseRate = null) {
    const { height, virusBorderY } = this.cfg
    this.cfg = {
      ...this.cfg,
      virusBorderY: Math.floor(virusBorderY) - Math.floor(height * (increaseRate || this.cfg.increaseRate))
    }
    // console.log('increasePollutedArea', { virusBorderY: this.cfg.virusBorderY })
    if (this.cfg.virusBorderY <= 0) {
      this.cfg.virusBorderY = 0
      this.lostGame()
    }
  }

  decreasePollutedArea () {
    const { height, virusBorderY } = this.cfg
    // this.cfg.virusBorderY += Math.floor(height * this.increaseRate)
    this.cfg = {
      ...this.cfg,
      virusBorderY: Math.floor(virusBorderY) + Math.floor(height * this.cfg.increaseRate)
    }
    // console.log('decreasePollutedArea', { virusBorderY: this.cfg.virusBorderY, height })
    if (this.cfg.virusBorderY > height) {
      this.cfg.virusBorderY = height
      this.wonGame()
    }
  }

  wonGame () {
    // this.setGameOvertimer()
    this.gameMode = Contracts.WON_THE_GAME
  }

  lostGame () {
    this.gameMode = Contracts.LOST_THE_GAME
  }

  startDemo () {
    this.demoMode = true
    this.increaseRate = 0.1
    this.gameMode = Contracts.ON_THE_GAME
    // this.resetMonsters()
    this.monsters.reset()
    // console.log('startDemo', { gameMode: this.gameMode, demoMode: this.demoMode })
    this.initGame()
  }

  startGame () {

    this.demoMode = false
    this.increaseRate = 0.01
    this.gameMode = Contracts.ON_THE_GAME
    this.monsters.reset()
    // console.log('startGame', { gameMode: this.gameMode, demoMode: this.demoMode })
    this.initGame()
  }

  async run (cfg) {
    const { ctx, width, height, timestamp, progress, frameSeq } = cfg

    const gameMode = this.gameMode || cfg.gameMode
    this.gameMode = gameMode
    // this.width = width
    // this.height = height

    this.cfg = {
      ...this.cfg,
      ...cfg
    }

    const virusBorderY = this.cfg.virusBorderY

    // console.log({ 'game run': this.cfg, 'gameMode': gameMode, 'demoMode': this.demoMode, virusBorderY })

    this.clearScreen(ctx, width, height)

    this.drawCleanZone(ctx, virusBorderY)
    this.drawPollutionZone(ctx, virusBorderY)

    if (this.demoMode) {
      this.showDemoInfo(ctx, width, height, timestamp)
    }

    // // S:Test
    // const text = 'D'
    // const font = 'Nosifer'
    // const x = 0
    // const y = 0
    // ctx.font = `bold 65px ${font}`
    // ctx.fillStyle = Contracts.COLOR_MONSTER
    // //ctx.textBaseline = "top" || "hanging" || "middle" || "alphabetic" || "ideographic" || "bottom";
    // ctx.textBaseline = 'top'
    // ctx.fillText(text, x, y)
    //
    // const { width: fw, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(text)
    // const w = Math.floor(fw)
    // const h = Math.floor(actualBoundingBoxAscent) + actualBoundingBoxDescent
    // console.log({ x, y, w, h, font })
    // // E:Test

    switch (true) {
      // init
      case (gameMode === Contracts.INIT_THE_GAME):
        // console.log('init game')
        return {
          callback: Contracts.INIT_THE_GAME
        }
      // Intro
      case (gameMode === Contracts.INTRO_THE_GAME):
        // console.log('intro game')
        this.showGameIntro({ ctx, virusBorderY, timestamp, progress, frameSeq })
        return {}
      case (gameMode !== Contracts.ON_THE_GAME):
        // console.log('end game')
        this.showGameInfo(ctx, virusBorderY)
        this.showGameEnding({ ctx, timestamp })
        return {}
      // Game On
      case (gameMode === Contracts.ON_THE_GAME):
        // console.log('play', this.demoMode)
        // console.log('play game')
        this.showGameInfo(ctx, virusBorderY)
        this.hero.run(virusBorderY, this.demoMode)
        this.monsters
          .run(virusBorderY)
          .then(response => {
            const { event, payload } = response || { event: null, payload: null }
            // console.log('monsters event:', { event, payload })
            switch (event) {
              case Contracts.EVENT_BULLET_HIT_MONSTER:
                // console.log('EVENT_BULLET_HIT_MONSTER')
                this.hitScore += this.hitScoreInterval
                const { monster: monster1 } = payload
                monster1.transformToHero(this.hero)
                this.decreasePollutedArea()
                break
              case Contracts.EVENT_MONSTER_HIT_HERO:
                // console.log('EVENT_MONSTER_HIT_HERO')
                const { monster: monster2 } = payload
                monster2.reset()
                if (this.hero.decreaseHealth()) {
                  this.increasePollutedArea(0.1)
                } else {
                  // gameOver
                  this.lostGame()
                }
                break
              case Contracts.EVENT_MONSTER_REACH_GROUND:
                // console.log('EVENT_MONSTER_REACH_GROUND')
                this.increasePollutedArea()
                break
            }
          })
    }

  }
}

export default Game
