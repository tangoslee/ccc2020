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
  import Hero from '@/models/hero'
  import Monster from '@/models/monster'

  export default {
    name: 'AppMain',
    data () {
      return {
        width: 512,
        height: 512,
        margin: 20,
        hero: null,
        hitScore: 0,
        gameResult: 0,
        monsters: [],
        pollutedY: 0,
        canvas: null,
        ctx: null,
        increaseRate: 0.1, // 10%
        game: {
          intro: null,
          play: null,
          ending: null
        },
        timer: {
          intro: 0
        },
        demoMode: false
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
      console.log('created')
      this.gameResult = Contracts.INTRO_THE_GAME
      this.initBulletIcon()
      this.$nextTick(function () {
        window.addEventListener('resize', this.handleResize)
        window.addEventListener('keyup', this.updateKeyUpEvent)
        window.addEventListener('keydown', this.updateKeyDownEvent)
      })
    },
    mounted () {
      this.canvas = this.$refs.canvas
      this.ctx = this.canvas.getContext('2d')

      this.handleResize()
      console.log('mounted', `${this.width}x${this.height}`)
    },
    methods: {
      random (min, max) {
        return Math.floor(Math.random() * max) + min
      },
      handleResize () {
        this.width = window.innerWidth - 1
        this.height = window.innerHeight - 1
        this.init()
      },
      init () {
        console.log('init')
        // console.log('canvas', canvas, ', ctx', this.ctx)
        this.demoMode = false
        this.timer = {
          intro: 10 + Math.floor(Date.now() / 1000)
        }

        this.canvas.width = this.width
        this.canvas.height = this.height
        this.initGame()
        this.initMonsters()
        this.run()
      },
      initGame () {
        this.pollutedY = Math.floor(this.height) * 0.8
        this.hitScore = 0
        if (this.hero) {
          this.hero.reset()
        }
      },
      initMonsters () {
        // Create monsters
        'ANDY'.split('').forEach(ch => {
          const monster = new Monster(this.ctx, this.width, this.pollutedY).setText(ch)
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
        if (this.gameResult === Contracts.ON_THE_GAME) {
          this.hero.updateKeyEvent(keyCode, false)
        } else if (keyCode === Contracts.KEY_CODE_S) {
          this.startGame()
        } else if (keyCode === Contracts.KEY_CODE_D) {
          this.startDemo()
        } else if (keyCode === Contracts.KEY_CODE_C) {
          this.continueGame()
        }
      },
      showGameIntro ({ ctx }) {
        // ctx.clearRect(0, 0, this.width, this.height)
        // ctx.beginPath()
        //
        // this.drawCleanZone(ctx, pollutedY)
        // this.drawPollutionZone(ctx, pollutedY)
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

        if (seconds === 0) {
          // this.continueGame()
          this.startDemo()
        }
      }
      ,
      showGameInfo (ctx) {
        const damageText = `${this.hero.damage}/${this.hero.maxDamage}`
        const hitScoreText = `${this.hitScore}`.padStart(5, '0')
        const gameInfoText = `DAMAGE: ${damageText} SCORE: ${hitScoreText}`

        ctx.font = `bold 36px ${Contracts.FONT_GAME_INFO}`
        ctx.fillStyle = `${Contracts.COLOR_GAME_INFO}`

        const x = Math.floor(this.width) * 0.5 - ctx.measureText(gameInfoText).width / 2
        const y = Math.floor(this.height) * 0.1

        ctx.fillText(gameInfoText, x, y)
      }
      ,
      dropMonsters (pollutedY) {
        this.monsters.forEach(monster => {
          monster.show()

          if (monster.isHit(this.hero.getBullets())) {
            this.hitScore++
            monster.transformToHero(this.hero)
            this.decreasePollutedArea()
          } else if (monster.hitHero(this.hero)) {
            monster.reset()
            if (this.hero.decreaseHealth()) {
              this.increasePollutedArea(0.1)
            } else {
              // gameOver
              // TODO quack sound
              this.gameResult = Contracts.LOST_THE_GAME
            }
          } else if (monster.drop(pollutedY)) {
            this.increasePollutedArea()
          }
        })
      }
      ,
      startDemo () {
        this.demoMode = true
        this.increaseRate = 0.1
        this.gameResult = Contracts.ON_THE_GAME
        this.resetMonsters()
        this.initGame()
      }
      ,
      startGame () {
        this.demoMode = false
        this.increaseRate = 0.01
        this.gameResult = Contracts.ON_THE_GAME
        this.resetMonsters()
        this.initGame()
      }
      ,
      continueGame () {
        this.gameResult = Contracts.ON_THE_GAME
      }
      ,
      showGameOver (ctx) {
        const font = this.gameResult === Contracts.WON_THE_GAME ? Contracts.FONT_WON_GAME : Contracts.FONT_LOSE_GAME
        const color = this.gameResult === Contracts.WON_THE_GAME ? Contracts.COLOR_WON_GAME : Contracts.COLOR_LOSE_GAME

        const gameResultText = this.gameResult === Contracts.WON_THE_GAME ? 'You Won!' : 'Game Over'
        const pressToStartText = 'Press "S" to Start'

        ctx.font = `bold 96px ${font}`
        ctx.fillStyle = `${color}`

        const x = Math.floor(this.width) * 0.5 - ctx.measureText(gameResultText).width / 2
        const y = Math.floor(this.height) * 0.5

        ctx.fillText(gameResultText, x, y)

        ctx.font = `bold 36px ${font}`
        ctx.fillText(pressToStartText, x, y + 96)

        ctx.font = `18px ${font}`
        ctx.fillText('Controls: Spacebar, Left, Right', x, y + 140)
      }
      ,
      increasePollutedArea (increaseRate = null) {
        this.pollutedY -= Math.floor(this.height) * (increaseRate || this.increaseRate)
        if (this.pollutedY <= 0) {
          this.pollutedY = 0
          this.gameResult = Contracts.LOST_THE_GAME
        }
      }
      ,
      decreasePollutedArea () {
        this.pollutedY += Math.floor(this.height) * this.increaseRate
        if (this.pollutedY > this.height) {
          this.pollutedY = this.height
          this.gameResult = Contracts.WON_THE_GAME
        }
      }
      ,
      drawCleanZone (ctx, y) {
        ctx.fillStyle = Contracts.COLOR_CLEAN_ZONE
        ctx.fillRect(0, 0, this.width, y)
      }
      ,
      drawPollutionZone (ctx, y) {
        ctx.fillStyle = Contracts.COLOR_POLLUTION_ZONE
        ctx.fillRect(0, y, this.width, this.height)
      }
      ,
      run () {
        window.requestAnimationFrame(this.run)

        if (this.ctx) {
          const pollutedY = Math.floor(this.pollutedY)

          // Clean area
          this.ctx.clearRect(0, 0, this.width, this.height)
          this.ctx.beginPath()

          this.drawCleanZone(this.ctx, pollutedY)
          this.drawPollutionZone(this.ctx, pollutedY)

          // console.log('gameResult:', this.gameResult)
          switch (true) {
            // Intro
            case (this.gameResult === Contracts.INTRO_THE_GAME):
              // this.game.intro.run()
              this.showGameIntro({ ctx: this.ctx, pollutedY })
              break
            // case (this.gameResult === Contracts.PLAY_DEMO):
            //   this.startDemo()
            //   break
            // Game Over
            case (this.gameResult !== Contracts.ON_THE_GAME) :
              // this.game.ending.run()
              this.showGameOver(this.ctx)
              break
            // Game On
            case (this.gameResult === Contracts.ON_THE_GAME) :
              // console.log('play', this.demoMode)
              // this.game.play.run()
              this.showGameInfo(this.ctx)
              this.hero.setDemoMode(this.demoMode).show(pollutedY)
              this.dropMonsters(pollutedY)
              break
          }

        } // ctx

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
