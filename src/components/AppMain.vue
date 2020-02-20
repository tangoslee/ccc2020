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

  import { SimpleStore } from '@/stores/simple-store'
  import Contracts from '@/Contracts'
  import Game from '@/models/Game'
  import Hero from '@/models/Hero'
  import Monsters from '@/models/Monsters'
  import Avengers from '@/models/Avengers'

  export default {
    name: 'AppMain',
    data () {
      return {
        timer: null,
        pause: false,
        game: null,
        canvas: null,
        frame1: null,
        frame2: null
      }
    },
    computed: {},
    created () {
      // console.log('created')
      this.$nextTick(() => {
        window.addEventListener('resize', this.handleResizeEvent)
        window.addEventListener('keyup', ({ keyCode }) => SimpleStore.publish(Contracts.KEY_UP_EVENT, { keyCode }))
        window.addEventListener('keydown', ({ keyCode }) => SimpleStore.publish(Contracts.KEY_DOWN_EVENT, { keyCode }))
      })

      SimpleStore.initState({
        god: false,
        debug: false,
        ctx: null,
        crew: 'CANDY',
        bulletIcon: null,
        fullscreen: false,
        gameCfg: {},
        width: 900,
        height: 900,
        gameMode: Contracts.INTRO_THE_GAME,
        demoMode: false,
        increaseRate: 0.05,
        virusBorderY: 0
      })

      SimpleStore.subscribe(Contracts.KEY_UP_EVENT, ({ keyCode }) => {
        switch (keyCode) {
          case Contracts.KEY_CODE_P:
            return this.togglePause()
          case Contracts.KEY_CODE_C:
            return this.continueGame()
          case Contracts.KEY_CODE_F:
            return this.useFullScreen()
        }
      })

      const hero = new Avengers(new Hero())
      const monsters = new Monsters(hero)
      this.game = new Game({ hero, monsters })

      this.initBulletIcon()
    },
    mounted () {
      this.canvas = this.$refs.canvas
      const ctx = this.canvas.getContext('2d')
      SimpleStore.publish(Contracts.GAME_CFG_UPDATED_EVENT, { ctx }, { ctx })
      this.handleResizeEvent()
      // console.log('mounted')
    },
    methods: {
      random (min, max) {
        return Math.floor(Math.random() * max) + min
      },
      handleResizeEvent () {
        let { fullscreen, width, height, gameCfg } = SimpleStore.state
        if (fullscreen) {
          width = window.innerWidth - 1
          height = window.innerHeight - 1
        } else {
          width = 900
          height = 900
        }

        if (width > 2560) {
          gameCfg = {
            ...gameCfg,
            heroSpeed: 50,
            monsterSpeedMin: 1,
            monsterSpeedMax: 20,
            fontSize: 36,
            bulletSize: 24,
            heroFontSize: 96,
            monsterFontSizeMin: 48,
            monsterFontSizeMax: 96,
            increasePollutedAreaRate: 0.08
          }

        } else if (width > 1024) {
          gameCfg = {
            ...gameCfg,
            heroSpeed: 25,
            monsterSpeedMin: 3,
            monsterSpeedMax: 12,
            fontSize: 32,
            bulletSize: 16,
            heroFontSize: 64,
            monsterFontSizeMin: 32,
            monsterFontSizeMax: 64,
            increasePollutedAreaRate: 0.04
          }
        } else {
          gameCfg = {
            ...gameCfg,
            heroSpeed: 16,
            monsterSpeedMin: 1,
            monsterSpeedMax: 4,
            fontSize: 24,
            bulletSize: 12,
            heroFontSize: 32,
            monsterFontSizeMin: 16,
            monsterFontSizeMax: 32,
            increasePollutedAreaRate: 0.01
          }
        }

        // console.log({ fullscreen, width, height })
        this.canvas.width = width
        this.canvas.height = height

        SimpleStore.publish(Contracts.GAME_CFG_UPDATED_EVENT, { width, height, gameCfg }, { width, height, gameCfg })
        this.init()
        // console.log('resized', `${width}x${height}`)
      },
      requestFrame () {
        const { gameMode, demoMode } = SimpleStore.state
        if (this.frame1) {
          window.cancelAnimationFrame(this.frame1)
        }
        if (demoMode && this.frame2) {
          window.cancelAnimationFrame(this.frame2)
        }
        if (!this.pause) {
          this.frame1 = window.requestAnimationFrame(this.run)
          if (gameMode === Contracts.ON_THE_GAME) {
            this.frame2 = window.requestAnimationFrame(this.run)
          }
        }
      },
      init () {
        // console.log('init')
        this.timer = null
        this.pause = false
        this.game.initGame()
        this.requestFrame()
      },
      initBulletIcon () {
        const image = new Image()
        image.src = Contracts.BULLET_ICON
        image.onload = () => SimpleStore.publish(Contracts.BULLET_ICON_LOADED, { bulletIcon: image }, { bulletIcon: image })
      },
      togglePause () {
        this.pause = !this.pause
        // console.log('pause', this.pause)
        if (!this.pause) {
          this.requestFrame()
        }
      },
      continueGame () {
        this.pause = false
        this.requestFrame()
      },
      useFullScreen () {
        const { fullscreen: old } = SimpleStore.state
        const payload = {
          fullscreen: !old
        }
        SimpleStore.publish(Contracts.GAME_CFG_UPDATED_EVENT, payload, payload)
        this.handleResizeEvent()
      },
      run (timestamp) {
        // https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp
        // console.log('AppMain.run()', { timestamp })

        if (this.timer === null) {
          this.timer = {
            diff: timestamp - (new Date(timestamp)).getSeconds()
          }
        }
        const { diff } = this.timer
        const seconds = (new Date(timestamp - diff)).getSeconds()
        // console.log(seconds)

        this.game.run(timestamp)

        this.requestFrame()
        // this.pause = true
      } // run

    } // methods
  }
</script>

<style scoped>
  main {
    height: 100%;
  }
</style>
