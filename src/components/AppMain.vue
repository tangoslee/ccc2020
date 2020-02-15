<template>
  <main role="main" class="fixed-top">
    <canvas ref="canvas"/>
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
  import Game from '@/models/Game'
  import Hero from '@/models/Hero'
  import Monster from '@/models/Monster'
  import Monsters from '@/models/Monsters'

  export default {
    name: 'AppMain',
    data () {
      return {
        pause: false,
        width: 512,
        height: 512,
        margin: 20,
        game: null,
        hero: null,
        hitScore: 0,
        hitScoreInterval: 10,
        gameMode: 0,
        monsters: null,
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
      this.game = new Game()
      this.hero = new Hero()
      this.monsters = new Monsters()
      this.monsters.setHero(this.hero)
      this.game
        .setHero(this.hero)
        .setMonsters(this.monsters)
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

      this.hero.setGame(this.ctx, this.width, this.height)
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
        this.game.initGame()
        // this.initGame()
        this.initMonsters()
        this.requestFrame()
      },
      initMonsters () {
        // Create monsters
        this.monsters.init(this.ctx, this.width, this.virusBorderY)
      },
      resetMonsters () {
        // this.monsters.map(monster => monster.reset())
        this.monsters.reset()
      },
      initBulletIcon () {
        const image = new Image()
        image.src = Contracts.BULLET_ICON
        image.onload = () => {
          // @deprecated
          //this.initHero(image)
          this.hero.setBulletIcon(image)
          console.log('bullet image loaded')
        }
      },
      updateKeyDownEvent (event) {
        const { keyCode } = event
        this.hero.updateKeyEvent(keyCode, true)
      },
      updateKeyUpEvent (event) {
        const { keyCode } = event
        // console.log('upKey', keyCode, this.gameMode)
        if (keyCode === Contracts.KEY_CODE_P) {
          return this.togglePause()
          // } else if (this.gameMode === Contracts.ON_THE_GAME) {
          //   console.log('updateKeyUpEvent')
          //   this.hero.updateKeyEvent(keyCode, false)
        } else if (keyCode === Contracts.KEY_CODE_S) {
          // TODO make pub/sub store
          // this.gameMode = Contracts.ON_THE_GAME
          return this.game.startGame()
        } else if (keyCode === Contracts.KEY_CODE_D) {
          return this.game.startDemo()
        } else if (keyCode === Contracts.KEY_CODE_C) {
          return this.continueGame()
        }
        this.hero.updateKeyEvent(keyCode, false)
      },
      togglePause () {
        this.pause = !this.pause
        // console.log('pause', this.pause)
        if (!this.pause) {
          this.requestFrame()
        }
      },
      continueGame () {
        // this.gameMode = Contracts.ON_THE_GAME
        this.pause = false
        this.requestFrame()
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

      /**
       * https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp
       *
       * @param timestamp
       */
      run (timestamp) {
        console.log('AppMain.run()', { gameMode: this.gameMode, width: this.width, height: this.height })
        // console.log((new Date()).getSeconds())
        // console.log('timestamp', timestamp)
        if (!this.start) {
          this.start = timestamp
        }

        let progress = Math.floor(timestamp - this.start)
        let frameSeq = Math.floor((progress + 1) / 33)
        // console.log('progress ', progress, ', idx:', frameSeq)

        if (this.ctx) {

          // const virusBorderY = this.virusBorderY
          // console.log({ gameMode: this.gameMode, virusBorderY: this.virusBorderY })

          this.game
            .run({
                ctx: this.ctx,
                width: this.width,
                height: this.height,
                // virusBorderY: this.virusBorderY,
                gameMode: this.gameMode,
                increaseRate: this.increaseRate
              }
            )

        } // ctx

        this.requestFrame()
        this.pause = true
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
