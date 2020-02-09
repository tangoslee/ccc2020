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

  import Hero from '@/models/hero'
  // import Bullet from '@/models/bullet'
  import Monster from '@/models/monster'

  export default {
    name: 'AppMain',
    data () {
      return {
        width: 512,
        height: 512,
        margin: 20,
        hero: null,
        stopFalling: false,
        gameResult: 0,
        monsters: [],
        pollutedY: 0,
        canvas: null,
        ctx: null,
        bulletIcon: null,
        increaseRate: 0.1 // 10%
      }
    },
    computed: {
      bulletIconData () {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAAAjVBMVEUAAADznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBKABGUXAAAALnRSTlMAAQIFCw0QFBUXHh8nLi8zQEFCQ01OUFFWWGFmgIWUlZqdnqKjrb7AwcXZ8fn7iUnKGQAAALlJREFUOMvN1NsOgjAMBuAC4gEFQTyAgnhGBfv+j2cbE8lITW8k4b9YtuzLku4E0EVm6803y7FsQjQyEtHBRCsRXfDYDBCTjlBU1g6glAc4dRmxKWj0G1G7p3VQQxjBXUclvHRUf2YbtLAoiYmwjTyuxe8NChyKxcji3lZEA/Mo/Y6Ra6K5iG45ZcjzE+49e7PjU0aBgk4h5dpGlX7pKnpIKjqDpyMqJtZQzLW4aWZDLmUHdpa6//zd3iWRgHSXg34VAAAAAElFTkSuQmCC'
      },
      // leftArrowIcon () {
      //   return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAAAmVBMVEUAAADAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSt78jkjAAAAMnRSTlMAAQIEBQYJFhcfKjE3PEFKWWNpbXF3eHl7iY6PkZKUlaOosLK0vsHDxcfMz9Pc4unx85MFw08AAACqSURBVDjLvdPJDoJQEETRQnAecVZwFhVn6/8/zoUElMjrToje9dl0Ug2k65IrB+amJHkqyoY8FwzGY1RHYehlGj82bCvM2pLNppDDzBRmLhvrB4bB8jO/8TILGmul7vraEUCNUgBcDWpqkBUI5gIA9s6MXIjq1o9W867GmZO094ka5VWHRA3/rgYqVc9WYYwmUKgeZHUvGRCckCQfZRhztuRVMAAq1fRXPQEmLGfoWF0nmgAAAABJRU5ErkJggg=='
      // },
      // rightArrowIcon () {
      //   return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAAAgVBMVEUAAADAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvAOSvLmoxzAAAAKnRSTlMAAQIFBgkXGB8rMjg9REpcY2Zpb3N7i4yPkaOmra+wsr7Fx87P0dzi6fOZ2SpjAAAAi0lEQVQ4jeXKNxLCQBAF0V4JhPcgPMKD/v0PSECkErUzRUBCh10PKqVbaUq8xlWSllGT3CRTjSRbreRQQzlU2HlUsnepw89V8bXqrTfVjqqpgaK91SWOlAMYRup40NiD+sDdMKcATOLmnAKE+dM0H1r8sek6DLnDMHMYmqVtoFXaBrKHVBgGknZWny+QKVdr6Dj2oQAAAABJRU5ErkJggg=='
      // },
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
      this.initBulletIcon()
      this.$nextTick(function () {
        window.addEventListener('resize', this.handleResize)
        window.addEventListener('keyup', this.updateKeyUpEvent)
        window.addEventListener('keydown', this.updateKeyDownEvent)
      })
    },
    mounted () {
      this.canvas = this.$refs.canvas
      this.handleResize()
      console.log('mounted', `${this.width}x${this.height}`)
    },
    methods: {
      random (min, max) {
        return Math.floor(Math.random() * max) + min
      },
      init () {
        this.ctx = this.canvas.getContext('2d')
        // console.log('canvas', canvas, ', ctx', this.ctx)
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.initGame()
        this.initMonsters()
        this.run()
      },
      initBulletIcon () {
        const image = new Image()
        image.src = this.bulletIconData
        image.onload = () => {
          // console.log('bulletIcon loaded')
          this.bulletIcon = image
          this.initHero()
        }
      },
      initHero () {
        this.hero = new Hero(this.ctx, this.width, this.height, { bulletIcon: this.bulletIcon })
      },
      initMonsters () {
        // Create monsters
        'ANDY'.split('').forEach(ch => {
          const item = new Monster(this.ctx, this.width, this.pollutedY).setText(ch)
          this.monsters.push(item)
        })
      },
      resetMonsters () {
        this.monsters.map(monster => monster.reset())
      },
      initGame () {
        this.pollutedY = Number(this.height * 0.8).toFixed(4)
        this.stopFalling = false
        this.gameResult = 0
        if (this.hero) {
          this.hero.initGame()
        }
      },
      handleResize () {
        this.width = window.innerWidth - 1
        this.height = window.innerHeight - 1
        this.init()
      },
      updateKeyDownEvent (event) {
        const { keyCode } = event
        this.hero.updateKeyEvent(keyCode, true)
      },
      updateKeyUpEvent (event) {
        const { keyCode } = event
        if (this.gameResult === 0) {
          this.hero.updateKeyEvent(keyCode, false)
        } else if (keyCode === 83) {
          this.startGame()
        } else if (keyCode === 68) {
          this.startDemo()
        }
      },
      dropMonsters (pollutedY) {
        this.monsters.forEach(monster => {
          monster.show()
          if (monster.drop(pollutedY)) {
            monster.reset()
            this.increasePollutedArea()
          } else if (monster.isHit(this.hero.getBullets())) {
            monster.reset()
            this.decreasePollutedArea()
          }
        })
      },
      startDemo () {
        this.initGame()
        this.increaseRate = 0.1
      },
      startGame () {
        this.resetMonsters()
        this.initGame()
        this.increaseRate = 0.01
      },
      showGameOver (ctx) {
        const font = this.gameResult === 1 ? 'Poller One' : 'Nosifer'
        const color = this.gameResult === 1 ? '#000' : '#c0392b'

        const gameResultText = this.gameResult === 1 ? 'You Won!' : 'Game Over'
        const pressToStartText = 'Press "S" to Start'

        ctx.font = `bold 96px ${font}`
        ctx.fillStyle = `${color}`

        const x = this.width * 0.5 - ctx.measureText(gameResultText).width / 2
        const y = this.height * 0.5

        ctx.fillText(gameResultText, x, y)

        ctx.font = `bold 36px ${font}`
        ctx.fillText(pressToStartText, x, y + 96)

        ctx.font = `18px ${font}`
        ctx.fillText('Controls: Spacebar, Left, Right', x, y + 140)
      },
      increasePollutedArea () {
        this.pollutedY -= this.height * this.increaseRate
        if (this.pollutedY <= 0) {
          this.pollutedY = 0
          this.stopFalling = true
          this.gameResult = -1
        }
      },
      decreasePollutedArea () {
        this.pollutedY += this.height * this.increaseRate
        if (this.pollutedY > this.height) {
          this.pollutedY = this.height
          this.stopFalling = true
          this.gameResult = 1
        }
      },
      run () {
        window.requestAnimationFrame(this.run)

        if (this.ctx) {
          const pollutedY = Number(this.pollutedY).toFixed(4)

          // Clean area
          this.ctx.clearRect(0, 0, this.width, this.height)
          this.ctx.beginPath()

          this.ctx.fillStyle = '#fed136'
          this.ctx.fillRect(0, 0, this.width, pollutedY)

          // Polluted area
          this.ctx.fillStyle = 'black'
          this.ctx.fillRect(0, pollutedY, this.width, this.height)

          // Game Over
          if (this.gameResult !== 0) {
            this.showGameOver(this.ctx)
          } else if (this.hero) {
            this.hero.show()

            if (!this.stopFalling) {
              this.dropMonsters(pollutedY)
            }
          }
        }

      }
    }
  }
</script>

<style scoped>
  main {
    height: 100%;
    /* background-color: #fed136;
    border-color: #fed136; */
  }
</style>
