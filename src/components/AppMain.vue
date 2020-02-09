<template>
  <main role="main" class="fixed-top">
    <canvas ref="canvas"></canvas>
  </main>
</template>

<script>
  import Item from './../models/item'

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
        monsters: [],
        pollutedY: 0,
        canvas: null,
        ctx: null
      }
    },
    computed: {
      bullet () {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAAAjVBMVEUAAADznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBLznBKABGUXAAAALnRSTlMAAQIFCw0QFBUXHh8nLi8zQEFCQ01OUFFWWGFmgIWUlZqdnqKjrb7AwcXZ8fn7iUnKGQAAALlJREFUOMvN1NsOgjAMBuAC4gEFQTyAgnhGBfv+j2cbE8lITW8k4b9YtuzLku4E0EVm6803y7FsQjQyEtHBRCsRXfDYDBCTjlBU1g6glAc4dRmxKWj0G1G7p3VQQxjBXUclvHRUf2YbtLAoiYmwjTyuxe8NChyKxcji3lZEA/Mo/Y6Ra6K5iG45ZcjzE+49e7PjU0aBgk4h5dpGlX7pKnpIKjqDpyMqJtZQzLW4aWZDLmUHdpa6//zd3iWRgHSXg34VAAAAAElFTkSuQmCC'
      },
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
        this.pollutedY = this.height * 0.8
        this.initMonsters()
        this.update()
      },
      initMonsters () {
        // craete monsters
        'ANDY'.split('').forEach(ch => {
          const item = new Item(this.ctx, this.width, this.pollutedY).setText(ch)
          this.monsters.push(item)
        })
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
        this.actor.keys[keyCode] = false
      },
      moveItem () {

      },
      update () {
        window.requestAnimationFrame(this.update)

        let { keys, velocityX, velocityY, velocityInterval, speed, friction, x, y } = this.actor
        let ctx = this.ctx

        // if (keys[38]) {
        //   if (velocityY > -speed) {
        //     velocityY -= velocityInterval
        //   }
        // }

        // if (keys[40]) {
        //   if (velocityY < speed) {
        //     velocityY += velocityInterval
        //   }
        // }

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
          const pollutedY = this.pollutedY

          ctx.clearRect(0, 0, this.width, this.height)
          ctx.beginPath()

          // Clean area
          ctx.fillStyle = '#fed136'
          ctx.fillRect(0, 0, this.width, pollutedY)

          // Polluted area
          ctx.fillStyle = 'black'
          ctx.fillRect(0, pollutedY, this.width, pollutedY)

          // packman
          // ctx.arc(x, y, 13, Math.PI / 7, -Math.PI / 7, false)
          // ctx.lineTo(x - 6, y)
          // dot
          // ctx.arc(x, y, 5, 0, Math.PI * 2)
          // ctx.fill()

          // text
          ctx.font = 'bold 160px sans-serif'
          ctx.fillStyle = '#fec036'
          ctx.fillText('C', x, y + pollutedY)

          this.monsters.forEach(monster => {
            monster.show()

            const timer = setTimeout(function () {
              if (monster.drop()) {
                monster.clearTimer()
                monster.reset()
              }
            }, this.random(3000, 6000))
            monster.setTimer(timer)
          })

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
