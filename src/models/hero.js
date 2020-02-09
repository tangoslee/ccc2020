import Bullet from '@/models/bullet'

class Hero {

  constructor (ctx, boxWidth, boxHeight, { bulletIcon }) {
    // console.log('hero created')

    this.ctx = ctx
    this.boxWidth = boxWidth
    this.boxHeight = boxHeight

    this.bulletIcon = bulletIcon
    this.text = 'C'

    this.bullets = []
    this.props = {
      keys: [],
      x: 150,
      y: 150,
      velocityX: 0,
      velocityY: 0,
      velocityInterval: 5,
      speed: 50,
      friction: 0.9 // 0.98,
    }

    this.limitMargin = 5
    this.xLimit = this.boxWidth - this.limitMargin
    this.yLimit = this.boxHeight - this.limitMargin
  }

  initGame () {
    this.props = {
      ...this.props,
      velocityX: 0,
      velocityY: 0
    }
    this.bullets = []
  }

  updateKeyEvent (key, value) {
    this.props.keys[key] = value
  }

  getBullets () {
    return this.bullets
  }

  fire (ctx, x, y) {
    // console.log('fire:', x, y)
    this.bullets.push(new Bullet(ctx, x, y))
  }

  show () {
    let { keys, velocityX, velocityY, velocityInterval, speed, friction, x, y } = this.props
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

    ctx.font = 'bold 160px Poller One'
    ctx.fillStyle = '#fec036'
    ctx.fillText(this.text, x, this.boxHeight - 50)

    this.bullets = [...this.bullets].filter(bullet => bullet.fire(this.bulletIcon))

    // fire by spacebar
    if (keys[32]) {
      const cText = ctx.measureText(this.text)
      // console.log(cText)
      keys[32] = false
      this.fire(ctx, x + cText.width / 2 + cText.actualBoundingBoxLeft, this.boxHeight - 50 - (cText.actualBoundingBoxAscent + cText.actualBoundingBoxDescent) - 32)
    }

    this.props = {
      ...this.props,
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

export default Hero
