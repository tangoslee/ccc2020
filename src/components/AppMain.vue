<template>
  <main role="main" class="fixed-top">
    <canvas ref="canvas"></canvas>
  </main>
</template>

<script>
  /**
   * @references
   * http://jsfiddle.net/loktar/dMYvG/
   * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
   * https://stackoverflow.com/questions/29130129/how-to-fillstyle-with-images-in-canvas-html5
   */

  import Contracts from '@/Contracts'
  import Hero from '@/models/Hero'
  import Monster from '@/models/Monster'

  export default {
    name: 'AppMain',
    data () {
      return {
        pause: false,
        width: 512,
        height: 512,
        margin: 20,
        hero: null,
        hitScore: 0,
        hitScoreInterval: 10,
        gameMode: 0,
        monsters: [],
        virusBorderY: 0,
        canvas: null,
        ctx: null,
        increaseRate: 0.1, // 10%
        timer: {
          intro: 0,
          gameover: 0
        },
        demoMode: false,
        start: null,
        frame1: null,
        frame2: null
      }
    },
    computed: {
      limitMargin () {
        return 5
      },
      xLimit () {
        return this.width - this.limitMargin
      },
      yLimit () {
        return this.height - this.limitMargin
      }
    },
    created () {
      // console.log('created')
      this.gameMode = Contracts.INTRO_THE_GAME
      this.initBulletIcon()
      this.$nextTick(function () {
        window.addEventListener('resize', this.handleResizeEvent)
        window.addEventListener('keyup', this.updateKeyUpEvent)
        window.addEventListener('keydown', this.updateKeyDownEvent)
      })
    },
    mounted () {
      this.canvas = this.$refs.canvas
      this.ctx = this.canvas.getContext('2d')

      this.handleResizeEvent()
      console.log('mounted', `${this.width}x${this.height}`)
    },
    methods: {
      random (min, max) {
        return Math.floor(Math.random() * max) + min
      },
      handleResizeEvent () {
        this.width = window.innerWidth - 1
        this.height = window.innerHeight - 1
        this.init()
      },
      requestFrame () {
        if (this.frame1) {
          window.cancelAnimationFrame(this.frame1)
        }
        if (!this.pause) {
          this.frame1 = window.requestAnimationFrame(this.run)
        }
      },
      init () {
        // console.log('init')
        this.pause = false
        this.start = null
        // console.log('canvas', canvas, ', ctx', this.ctx)
        this.demoMode = false
        this.timer = {
          intro: 7 + Math.floor(Date.now() / 1000)
        }

        this.canvas.width = this.width
        this.canvas.height = this.height
        this.initGame()
        this.initMonsters()
        this.requestFrame()
      },
      initGame () {
        this.virusBorderY = Math.floor(this.height * 0.8)
        this.hitScore = 0
        if (this.hero) {
          this.hero.reset()
        }
      },
      initMonsters () {
        // Create monsters
        this.monsters = []
        'ANDY'.split('').forEach(ch => {
          const monster = new Monster(this.ctx, this.width, this.virusBorderY).setText(ch)
          this.monsters.push(monster)
        })
      },
      resetMonsters () {
        this.monsters.map(monster => monster.reset())
      },
      initHero (bulletIcon) {
        this.hero = new Hero(this.ctx, this.width, this.height, { bulletIcon })
      },
      initBulletIcon () {
        const image = new Image()
        image.src = Contracts.BULLET_ICON
        image.onload = () => this.initHero(image)
      },
      updateKeyDownEvent (event) {
        const { keyCode } = event
        this.hero.updateKeyEvent(keyCode, true)
      },
      updateKeyUpEvent (event) {
        const { keyCode } = event
        // console.log(keyCode)
        if (keyCode === Contracts.KEY_CODE_P) {
          this.togglePause()
        } else if (this.gameMode === Contracts.ON_THE_GAME) {
          this.hero.updateKeyEvent(keyCode, false)
        } else if (keyCode === Contracts.KEY_CODE_S) {
          this.startGame()
        } else if (keyCode === Contracts.KEY_CODE_D) {
          this.startDemo()
        } else if (keyCode === Contracts.KEY_CODE_C) {
          this.continueGame()
        }
      },
      togglePause () {
        this.pause = !this.pause
        // console.log('pause', this.pause)
        if (!this.pause) {
          this.requestFrame()
        }
      },
      showGameIntro ({ ctx }) {
        // ctx.clearRect(0, 0, this.width, this.height)
        // ctx.beginPath()
        //
        // this.drawCleanZone(ctx, virusBorderY)
        // this.drawPollutionZone(ctx, virusBorderY)
        const seconds = Math.floor(this.timer.intro) - Math.floor(Date.now() / 1000)
        const introTexts = Contracts.INTRO_TEXT
          .replace('##SEC##', `${seconds}`)
          .split('\n')

        ctx.font = `bold 36px ${Contracts.FONT_GAME_INFO}`
        ctx.fillStyle = `${Contracts.COLOR_GAME_INFO}`

        let lineHeight = 36
        for (let introText of introTexts) {
          const x = Math.floor(this.width) * 0.5 - ctx.measureText(introText).width / 2
          const y = Math.floor(this.height) * 0.1

          ctx.fillText(introText, x, y + lineHeight)
          lineHeight += 36
        }

        if (seconds <= 0) {
          this.startDemo()
        }
      },
      showGameEnding (ctx) {
        const seconds = Math.floor(this.timer.gameover) - Math.floor(Date.now() / 1000)

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

        const x = Math.floor(this.width) * 0.5 - ctx.measureText(gameModeText).width / 2
        const y = Math.floor(this.height) * 0.5

        ctx.fillText(gameModeText, x, y)

        ctx.font = `bold 36px ${font}`
        ctx.fillText(pressToStartText, x, y + 96)

        ctx.font = `24px ${font}`
        ctx.fillText(`Continue to after ${seconds} second${seconds !== 1 ? 's' : ''}`, x, y + 140)

        if (seconds <= 0) {
          // console.log('time over')
          this.gameMode = Contracts.INTRO_THE_GAME
          this.init()
        }

      },
      increasePollutedArea (increaseRate = null) {
        this.virusBorderY -= Math.floor(this.height * (increaseRate || this.increaseRate))
        if (this.virusBorderY <= 0) {
          this.virusBorderY = 0
          this.lostGame()
        }
      },
      showGameInfo (ctx, virusBorderY) {
        const virusPollutionDegree = Math.floor((this.height - virusBorderY) / this.height * 100)
        // console.log('virusPollutionDegree', virusPollutionDegree, virusBorderY, this.height)
        const crewSaved = this.hero.text.length - 1

        const damageText = `${this.hero.damage}/${this.hero.maxDamage}`
        const hitScoreText = `${this.hitScore}`.padStart(5, '0')
        const gameInfoText = `POLLUTION: ${virusPollutionDegree}/100 DAMAGE: ${damageText} SCORE: ${hitScoreText} CREW: ${crewSaved}/4`

        ctx.font = `bold 36px ${Contracts.FONT_GAME_INFO}`
        ctx.fillStyle = `${Contracts.COLOR_GAME_INFO}`

        const x = Math.floor(this.width) * 0.5 - ctx.measureText(gameInfoText).width / 2
        const y = Math.floor(this.height) * 0.1

        ctx.fillText(gameInfoText, x, y)
      },
      dropMonsters (virusBorderY) {
        // console.log('monsters', this.monsters.length)
        this.monsters.forEach(monster => {
          monster.show()

          if (monster.isHit(this.hero.getBullets())) {
            this.hitScore += this.hitScoreInterval
            monster.transformToHero(this.hero)
            this.decreasePollutedArea()
          } else if (monster.hitHero(this.hero)) {
            monster.reset()
            if (this.hero.decreaseHealth()) {
              this.increasePollutedArea(0.1)
            } else {
              // gameOver
              // TODO quack sound
              this.lostGame()
            }
          } else if (monster.drop(virusBorderY)) {
            this.increasePollutedArea()
          }
        })
      },
      startDemo () {
        this.demoMode = true
        this.increaseRate = 0.1
        this.gameMode = Contracts.ON_THE_GAME
        this.resetMonsters()
        this.initGame()
      },
      startGame () {
        this.demoMode = false
        this.increaseRate = 0.01
        this.gameMode = Contracts.ON_THE_GAME
        this.resetMonsters()
        this.initGame()
      },
      continueGame () {
        this.gameMode = Contracts.ON_THE_GAME
      },
      setGameOvertimer () {
        this.timer.gameover = 5 + Math.floor(Date.now() / 1000)
      },
      wonGame () {
        this.setGameOvertimer()
        this.gameMode = Contracts.WON_THE_GAME
      },
      lostGame () {
        this.setGameOvertimer()
        this.gameMode = Contracts.LOST_THE_GAME
      },
      decreasePollutedArea () {
        this.virusBorderY += Math.floor(this.height * this.increaseRate)
        if (this.virusBorderY > this.height) {
          this.virusBorderY = this.height
          this.wonGame()
        }
      },
      drawCleanZone (ctx, y) {
        ctx.fillStyle = Contracts.COLOR_CLEAN_ZONE
        ctx.fillRect(0, 0, this.width, y)
      },
      drawPollutionZone (ctx, y) {
        ctx.fillStyle = Contracts.COLOR_POLLUTION_ZONE
        ctx.fillRect(0, y, this.width, this.height)
      },
      /**
       * https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp
       *
       * @param timestamp
       */
      run (timestamp) {
        // console.log((new Date()).getSeconds())
        // console.log('timestamp', timestamp)
        if (!this.start) {
          this.start = timestamp
        }

        let progress = Math.floor(timestamp - this.start)
        let frameSeq = Math.floor((progress + 1) / 33)
        // console.log('progress ', progress, ', idx:', frameSeq)

        if (this.ctx) {

          const virusBorderY = this.virusBorderY

          // Clean area
          this.ctx.clearRect(0, 0, this.width, this.height)
          this.ctx.beginPath()

          this.drawCleanZone(this.ctx, virusBorderY)
          this.drawPollutionZone(this.ctx, virusBorderY)

          // console.log('gameMode:', this.gameMode)
          switch (true) {
            // Intro
            case (this.gameMode === Contracts.INTRO_THE_GAME):
              this.showGameIntro({ ctx: this.ctx, virusBorderY })
              break
            // case (this.gameMode === Contracts.PLAY_DEMO):
            //   this.startDemo()
            //   break
            // Game Over
            case (this.gameMode !== Contracts.ON_THE_GAME) :
              this.showGameInfo(this.ctx, virusBorderY)
              this.showGameEnding(this.ctx)
              break
            // Game On
            case (this.gameMode === Contracts.ON_THE_GAME) :
              // console.log('play', this.demoMode)
              this.showGameInfo(this.ctx, virusBorderY)
              this.hero.setDemoMode(this.demoMode).show(virusBorderY)
              this.dropMonsters(virusBorderY)
              break
          }

        } // ctx

        this.requestFrame()
      } // run

    } // methods
  }
</script>

<style scoped>
  main {
    height: 100%;
    /* background-color: #fed136;
    border-color: #fed136; */
  }
</style>
