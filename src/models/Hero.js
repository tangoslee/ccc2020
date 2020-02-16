import { SimpleStore } from '@/stores/simple-store'
import Bullet from '@/models/Bullet'
import Contracts from '@/Contracts'
import Damage from '@/models/Damage'

class Hero {

  constructor () {
    // console.log('hero created')

    this.limitMargin = 5
    this.damage = new Damage(Contracts.HERO)

    this.reset()

    SimpleStore.subscribe(Contracts.KEY_DOWN_EVENT, ({ keyCode }) => {
      this.props.keys[keyCode] = true
    })

    SimpleStore.subscribe(Contracts.KEY_UP_EVENT, ({ keyCode }) => {
      this.props.keys[keyCode] = false
    })

    SimpleStore.subscribe(Contracts.BULLET_ICON_LOADED, ({ bulletIcon }) => {
      this.bulletIcon = bulletIcon
    })

  }

  reset () {
    // console.log('reset hero')
    const { height } = SimpleStore.state
    this.initCountValue = 0
    this.props = {
      keys: [],
      velocityX: 0,
      velocityInterval: 5,
      speed: 50,
      friction: 0.9 // 0.98,
    }
    this.x = 150
    this.y = height - 50
    this.bullets = []

    this.text = 'A'
    this.color = Contracts.COLOR_HERO
    this.font = Contracts.FONT_HERO
    this.damage.reset()
    this.candyMap = [...'CANDY'].reduce((p, c) => ({ ...p, [c]: false }), {})
  }

  getBullets () {
    return this.bullets
  }

  addText (text) {
    // FIXME to be better...
    [...`${this.text}${text}`]
      .forEach(c => this.candyMap[c] = true)
    this.text = Object.keys(this.candyMap).filter(c => this.candyMap[c]).join('')
  }

  fire (ctx, x, y) {
    // console.log('fire:', x, y)
    const { height } = SimpleStore.state
    this.bullets.push(new Bullet(ctx, x, y, height))
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline
   * //ctx.textBaseline = "top" || "hanging" || "middle" || "alphabetic" || "ideographic" || "bottom";
   * @param x
   */
  drawHero (x, y) {

    const { ctx, debug, width, height } = SimpleStore.state
    ctx.font = `bold ${Contracts.FONT_SIZE_HERO}px ${this.font}`
    ctx.fillStyle = this.color

    const { width: textWidth, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(this.text)

    this.w = Math.floor(textWidth)
    this.h = Math.floor(actualBoundingBoxAscent) + Math.floor(actualBoundingBoxDescent)
    let offsetY = Math.floor(y) - Math.floor(this.h / 5) // 10% above on the borderY
    if (offsetY + this.h > height) {
      offsetY = height - this.h
    }
    // console.log('drawHero', { x, y: this.y })
    ctx.textBaseline = 'top'
    ctx.fillText(this.text, x, offsetY)

    // //S:debug
    if (debug) {
      const font = ctx.font
      ctx.save()
      ctx.font = `10px serif`
      ctx.fillStyle = Contracts.COLOR_MONSTER
      ctx.textBaseline = 'top'
      ctx.fillText(`x:${x},y:${this.y},w:${this.w},h:${this.h}, font: ${font}`, this.x, offsetY)
      ctx.restore()
    }
    // //E:debug

    this.y = offsetY
  }

  decreaseHealth () {
    this.damage.increase()
    const { color, font } = this.damage.style
    this.color = color
    this.font = font
    return this.damage.value < this.damage.maxDamage
  }

  getDemoControl () {
    const ms = Date.now()
    const k = Math.floor(ms / 240) % 240 % 10
    const f = Math.floor(ms) % 10
    const xVelocity = (k > 6) ? -5 : 5
    const fired = f < 1

    return {
      xVelocity,
      fired
    }
  }

  show (timestamp) {
    const { demoMode, ctx, width, virusBorderY } = SimpleStore.state
    let { keys, velocityX, velocityInterval, speed, friction } = this.props
    
    let x = this.x
    const xLimit = Math.floor(width) - this.limitMargin

    // leftArrow
    if (keys[Contracts.KEY_CODE_LEFT_ARROW]) {
      // console.log('show leftArrow', { velocityX, speed: -speed })
      if (velocityX > -speed) {
        velocityX -= velocityInterval
      }
    }

    // rightArrow
    if (keys[Contracts.KEY_CODE_RIGHT_ARROW]) {
      // console.log('show rightArrow', { velocityX, speed: -speed })
      if (velocityX < speed) {
        velocityX += velocityInterval
      }
    }

    //S: Control Demo
    if (demoMode) {
      const { xVelocity, fired } = this.getDemoControl()
      velocityX = xVelocity
      keys[Contracts.KEY_CODE_SPACEBAR] = fired
    }
    // E: Control Demo

    velocityX = Math.floor(velocityX) * friction
    x += velocityX

    // console.log('hero speed ', { velocityX, x, virusBorderY })
    // console.log({ xLimit, limitMargin: this.limitMargin, w: this.w })

    if (x >= xLimit) {
      x = this.limitMargin
    } else if (x <= this.limitMargin - Math.floor(this.w / 2)) {
      x = xLimit
    }

    this.drawHero(x, virusBorderY)

    this.bullets = [...this.bullets].filter(bullet => bullet.fire(this.bulletIcon))

    // fire by spacebar
    if (keys[Contracts.KEY_CODE_SPACEBAR]) {
      const cText = ctx.measureText(this.text)
      // console.log(cText)
      keys[Contracts.KEY_CODE_SPACEBAR] = false
      this.fire(ctx, x + this.w / 2 + cText.actualBoundingBoxLeft, this.y - 10)
    }

    this.props = {
      ...this.props,
      keys,
      velocityX,
      speed,
      friction
    }

    // this.ctx = ctx
    this.x = Math.floor(x)
  }

  run (timestamp) {
    this.show(timestamp)
  }

}

export default Hero
