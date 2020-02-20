import { SimpleStore } from '@/stores/simple-store'
import Contracts from '@/Contracts'

class Game {
  constructor ({ hero, monsters }) {

    this.hero = hero || null
    this.monsters = monsters || null

    this.hitScore = 0
    this.hitScoreInterval = 1

    // timer
    this.introTimer = null
    this.demoTimer = null

    // key up event
    SimpleStore.subscribe(Contracts.KEY_UP_EVENT, ({ keyCode }) => {
      switch (keyCode) {
        case Contracts.KEY_CODE_S:
          this.startGame()
          break
        case Contracts.KEY_CODE_D:
          this.startDemo()
          break
      }
    })

    SimpleStore.subscribe(Contracts.EVENT_BULLET_HIT_MONSTER, ({ monster }) => {
      this.hitScore += this.hitScoreInterval
      if (monster.cure()) {
        monster.transformToHero(this.hero)
      }
      this.decreasePollutedArea()
    })

    SimpleStore.subscribe(Contracts.EVENT_MONSTER_HIT_HERO, ({ monster, hero }, { state }) => {
      const { gameCfg } = state
      monster.reset()
      if (hero.decreaseHealth()) {
        this.increasePollutedArea(gameCfg.increasePollutedAreaRate)
      } else if (hero.isLeader) {
        // gameOver
        this.lostGame()
      }
    })
    SimpleStore.subscribe(Contracts.EVENT_MONSTER_REACH_GROUND, () => this.increasePollutedArea())
  }

  initGame () {
    // this.cfg.virusBorderY = Math.floor(this.height * 0.8)
    const { height } = SimpleStore.state
    const virusBorderY = Math.floor(height * 0.8)
    SimpleStore.publish(Contracts.GAME_CFG_UPDATED_EVENT, { virusBorderY }, { virusBorderY })
    // console.log({ 'initGame': height, virusBorderY })

    this.monsters.init()

    this.hitScore = 0
    this.worldSaved = 0

    if (!!this.hero) {
      this.hero.reset()
    }

    this.introTimer = null
    this.demoTimer = null
  }

  // setHero (hero) {
  //   this.hero = hero
  //   return this
  // }
  //
  // setMonsters (monsters) {
  //   this.monsters = monsters
  //   return this
  // }

  displayText (text, lineHeightInterval, offsetX = null, offsetY = null) {
    const { ctx, width, height } = SimpleStore.state
    let lineHeight = lineHeightInterval
    for (let line of text.split('\n')) {
      const x = offsetX !== null ? offsetX : Math.floor(width) * 0.5 - ctx.measureText(line).width / 2
      const y = offsetY !== null ? offsetY : Math.floor(height) * 0.1

      ctx.fillText(line, x, y + lineHeight)
      lineHeight += lineHeightInterval
    }
  }

  clearScreen () {
    const { ctx, width, height } = SimpleStore.state
    ctx.clearRect(0, 0, width, height)
    ctx.beginPath()
  }

  drawCleanZone () {
    const { ctx, width, virusBorderY } = SimpleStore.state
    ctx.fillStyle = Contracts.COLOR_CLEAN_ZONE
    ctx.fillRect(0, 0, width, virusBorderY)
  }

  drawPollutionZone () {
    const { ctx, width, height, virusBorderY } = SimpleStore.state
    ctx.fillStyle = Contracts.COLOR_POLLUTION_ZONE
    ctx.fillRect(0, virusBorderY, width, height)
  }

  showDemoInfo (timestamp) {
    const { ctx, width, height, demoMode } = SimpleStore.state
    if (demoMode) {
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
  }

  showGameInfo () {
    const { ctx, width, height, virusBorderY, gameCfg } = SimpleStore.state

    if (!this.hero) {
      throw new Error('hero not set')
    }

    const virusPollutionDegree = Math.floor((height - virusBorderY) / height * 100)
    // console.log('virusPollutionDegree', virusPollutionDegree, virusBorderY, this.height)

    const crewSaved = this.hero.crewSaved
    const worldSaved = this.worldSaved

    const damageText = `${this.hero.damage.value}/${this.hero.damage.maxDamage}`
    const hitScoreText = `${this.hitScore}`.padStart(5, '0')
    const gameInfoText = `POLLUTION: ${virusPollutionDegree}/100 DAMAGE: ${damageText} SCORE: ${hitScoreText}\n
     SAVE CREW: ${crewSaved}/4 WORLD: ${worldSaved}/1`

    // let fontSize = 36
    //
    // if (width < 1024) {
    //   fontSize = 32
    // }

    ctx.font = `bold ${gameCfg.fontSize}px ${Contracts.FONT_GAME_INFO}`
    ctx.fillStyle = `${Contracts.COLOR_GAME_INFO}`

    this.displayText(gameInfoText, Math.floor(gameCfg.fontSize * 0.65))
  }

  showGameIntro (timestamp) {
    const { ctx, width, height, gameCfg } = SimpleStore.state

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

    const { fontSize } = gameCfg
    const lineHeightInterval = Math.floor(fontSize * 0.75)

    ctx.font = `bold ${fontSize}px ${Contracts.FONT_GAME_INFO}`
    ctx.fillStyle = `${Contracts.COLOR_GAME_INFO}`

    this.displayText(introTexts, lineHeightInterval)
  }

  showGameEnding (timestamp) {
    SimpleStore.publish(Contracts.GAME_CFG_UPDATED_EVENT, { demoMode: false }, { demoMode: false })
    const { ctx, width, height } = SimpleStore.state

    if (this.introTimer === null) {
      this.introTimer = {
        diff: timestamp - (new Date(timestamp)).getSeconds(),
        timer: 7
      }
    }
    const { diff, timer } = this.introTimer
    const seconds = timer - (new Date(timestamp - diff)).getSeconds()

    if (seconds <= 0) {
      const gameMode = Contracts.INTRO_THE_GAME
      SimpleStore.publish(Contracts.GAME_CFG_UPDATED_EVENT, { gameMode }, { gameMode })
      return
    }

    let font = Contracts.FONT_LOSE_GAME
    let color = Contracts.COLOR_LOSE_GAME
    let gameModeText = 'Game Over'

    if (SimpleStore.state.gameMode === Contracts.WON_THE_GAME) {
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

  increasePollutedArea (increaseRate = 0) {
    const { god, height, virusBorderY: oldVirusBorderY, increaseRate: defaultIncreaseRate } = SimpleStore.state

    if (god) {
      return virusBorderY
    }

    let val = Math.floor(oldVirusBorderY) - Math.floor(height * (increaseRate || defaultIncreaseRate))

    const virusBorderY = val > 0 ? val : 0
    SimpleStore.publish(Contracts.GAME_CFG_UPDATED_EVENT, { virusBorderY }, { virusBorderY })

    // console.log('increasePollutedArea', { oldVirusBorderY, val, virusBorderY })
    return virusBorderY
  }

  decreasePollutedArea (increaseRate = 0) {
    const { height, virusBorderY: oldVirusBorderY, increaseRate: defaultIncreaseRate } = SimpleStore.state
    let val = Math.floor(oldVirusBorderY) + Math.floor(height * (increaseRate || defaultIncreaseRate))

    const virusBorderY = val > height ? height : val
    SimpleStore.publish(Contracts.GAME_CFG_UPDATED_EVENT, { virusBorderY }, { virusBorderY })
    return virusBorderY
  }

  wonGame () {
    const gameMode = Contracts.WON_THE_GAME
    SimpleStore.publish(Contracts.GAME_CFG_UPDATED_EVENT, { gameMode }, { gameMode })
  }

  lostGame () {
    const gameMode = Contracts.LOST_THE_GAME
    SimpleStore.publish(Contracts.GAME_CFG_UPDATED_EVENT, { gameMode }, { gameMode })
  }

  startDemo () {
    const increaseRate = 0.067
    const demoMode = true
    const gameMode = Contracts.ON_THE_GAME
    SimpleStore.publish(Contracts.GAME_CFG_UPDATED_EVENT, { gameMode }, { gameMode, demoMode, increaseRate })
    this.monsters.reset()
    // console.log('startDemo', { gameMode: this.gameMode, demoMode: this.demoMode })
    this.initGame()
  }

  startGame () {
    const increaseRate = 0.01
    const demoMode = false
    const gameMode = Contracts.ON_THE_GAME
    SimpleStore.publish(Contracts.GAME_CFG_UPDATED_EVENT, { gameMode }, { gameMode, demoMode, increaseRate })
    this.monsters.reset()
    // console.log('startGame', { gameMode: this.gameMode, demoMode: this.demoMode })
    this.initGame()
  }

  checkGameResult () {
    const { height, virusBorderY } = SimpleStore.state
    const crewSaved = this.hero.crewSaved
    this.worldSaved = virusBorderY >= height ? 1 : 0
    if (this.worldSaved && crewSaved === 4) {
      this.wonGame()
    } else if (virusBorderY <= 0) {
      this.lostGame()
    }
  }

  run (timestamp) {
    const { gameMode } = SimpleStore.state

    this.clearScreen()

    this.drawCleanZone()
    this.drawPollutionZone()

    this.showDemoInfo(timestamp)

    switch (gameMode) {
      // Intro
      case Contracts.INTRO_THE_GAME:
        // console.log('intro game')
        this.showGameIntro(timestamp)
        break
      case Contracts.WON_THE_GAME:
      case Contracts.LOST_THE_GAME:
        // console.log('end game')
        this.showGameInfo()
        this.showGameEnding(timestamp)
        break
      // Game On
      case Contracts.ON_THE_GAME:
        // console.log('play game')
        this.showGameInfo()
        this.hero.run(timestamp)
        this.monsters.run()
        this.checkGameResult()
    }

  }
}

export default Game
