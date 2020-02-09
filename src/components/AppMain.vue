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

  import Bullet from '@/models/bullet'
  import Monster from '@/models/monster'

  export default {
    name: 'AppMain',
    data () {
      return {
        width: 512,
        height: 512,
        margin: 20,
        actor: {
          keys: [],
          x: 150,
          y: 150,
          velocityX: 0,
          velocityY: 0,
          velocityInterval: 5,
          speed: 50,
          friction: 0.9 // 0.98,
        },
        stopFalling: false,
        gameResult: 0,
        monsters: [],
        bullets: [],
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

      const image = new Image()
      image.src = this.bulletIconData
      image.onload = () => {
        this.bulletIcon = image
      }

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
        this.initMonsters()
        this.initGame()
        this.run()
      },
      initMonsters () {
        // craete monsters
        'ANDY'.split('').forEach(ch => {
          const item = new Monster(this.ctx, this.width, this.pollutedY).setText(ch)
          this.monsters.push(item)
        })
      },
      resetMonsters () {
        this.monsters.map(monster => monster.reset())
      },
      initGame () {
        this.actor = {
          ...this.actor,
          velocityX: 0,
          velocityY: 0
        }
        this.pollutedY = Number(this.height * 0.8).toFixed(4)
        this.stopFalling = false
        this.gameResult = 0
        this.bullets = []
      },
      handleResize () {
        this.width = window.innerWidth - 1
        this.height = window.innerHeight - 1
        this.init()
      },
      updateKeyDownEvent (event) {
        const { keyCode } = event
        this.actor.keys[keyCode] = true
      },
      updateKeyUpEvent (event) {
        const { keyCode } = event
        if (this.gameResult !== 0 && keyCode === 83) {
          this.startGame()
        } else {
          this.actor.keys[keyCode] = false
        }
      },
      dropMonsters (pollutedY) {
        this.monsters.forEach(monster => {
          monster.show()
          if (monster.drop(pollutedY)) {
            monster.clearTimer()
            monster.reset()
            this.increasePollutedArea()
          } else if (monster.isHit(this.bullets)) {
            monster.clearTimer()
            monster.reset()
            this.decreasePollutedArea()
          }
        })
      },
      demoGame () {
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
        // const x = this.width * 0.5 - 96 * 4
        // console.log('gameover!!', this.width * 0.5, ', ', this.height * 0.5)

        // ctx.font = 'bold 160px sans-serif'
        // ctx.fillStyle = '#fec036'
        //
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
      fire (ctx, x, initY) {
        console.log('fire:', x, initY, this.pollutedY)
        this.bullets.push(new Bullet(ctx, x, initY))
      },
      run () {
        window.requestAnimationFrame(this.run)

        let { keys, velocityX, velocityY, velocityInterval, speed, friction, x, y } = this.actor
        let ctx = this.ctx

        // leftArrow
        if (keys[37]) {
          if (velocityX > -speed) {
            velocityX -= velocityInterval
          }
        }

        // rightArrow
        if (keys[39]) {
          if (velocityX < speed) {
            velocityX += velocityInterval
          }
        }

        velocityX *= friction
        x += velocityX

        if (x >= this.xLimit) {
          x = this.limitMargin
        } else if (x <= this.limitMargin) {
          x = this.xLimit
        }

        velocityY *= friction
        y += velocityY

        if (y > this.yLimit) {
          y = this.yLimit
        } else if (y <= this.limitMargin) {
          y = this.limitMargin
        }

        // console.log(x, ',', y, ' : ', this.xLimit, this.yLimit)

        if (ctx) {
          const pollutedY = Number(this.pollutedY).toFixed(4)

          // Clean area
          ctx.clearRect(0, 0, this.width, this.height)
          ctx.beginPath()

          ctx.fillStyle = '#fed136'
          ctx.fillRect(0, 0, this.width, pollutedY)

          // Polluted area
          ctx.fillStyle = 'black'
          ctx.fillRect(0, pollutedY, this.width, this.height)

          // Game Over
          if (this.gameResult !== 0) {
            this.showGameOver(ctx)
          } else {
            // actor
            // font-family: 'Poller One', cursive;
            ctx.font = 'bold 160px Poller One'
            ctx.fillStyle = '#fec036'
            ctx.fillText('C', x, this.height - 50)

            this.bullets = [...this.bullets].filter(bullet => bullet.fire(this.bulletIcon))

            // fire by spacebar
            if (keys[32]) {
              console.log(ctx.measureText('C'))
              keys[32] = false
              const cText = ctx.measureText('C')
              this.fire(ctx, x + cText.width / 2 + cText.actualBoundingBoxLeft, this.height - 50 - (cText.actualBoundingBoxAscent + cText.actualBoundingBoxDescent) - 32)
            }
          }

          if (!this.stopFalling) {
            this.dropMonsters(pollutedY)
          }

        }

        this.actor = {
          ...this.actor,
          keys,
          velocityX,
          velocityY,
          speed,
          friction,
          x,
          y
        }
        this.ctx = ctx
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
