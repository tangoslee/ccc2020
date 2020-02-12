import Bullet from '@/models/Bullet'
import Contracts from '@/Contracts'

class Hero {

  constructor (ctx, boxWidth, boxHeight, { bulletIcon }) {
    // console.log('hero created')

    this.ctx = ctx
    this.boxWidth = Math.floor(boxWidth)
    this.boxHeight = Math.floor(boxHeight)

    this.bulletIcon = bulletIcon

    this.limitMargin = 5
    this.xLimit = this.boxWidth - this.limitMargin
    // this.yLimit = this.boxHeight - this.limitMargin

    this.damageRange = [
      Contracts.COLOR_HERO_SHADE_1,
      Contracts.COLOR_HERO_SHADE_2,
      Contracts.COLOR_HERO_SHADE_3,
      Contracts.COLOR_HERO_SHADE_4,
      Contracts.COLOR_HERO_SHADE_5,
      Contracts.COLOR_HERO_SHADE_6,
      Contracts.COLOR_HERO_SHADE_7,
      Contracts.COLOR_HERO_SHADE_8,
      Contracts.COLOR_HERO_SHADE_9,
      Contracts.COLOR_HERO_SHADE_10,
      Contracts.COLOR_HERO_SHADE_11,
      Contracts.COLOR_HERO_SHADE_12,
      Contracts.COLOR_HERO_SHADE_13
    ]

    this.maxDamage = 13

    this.reset()
  }

  reset () {
    // console.log('reset hero')
    this.demoMode = false
    this.initCountValue = 0
    this.props = {
      keys: [],
      velocityX: 0,
      velocityInterval: 5,
      speed: 50,
      friction: 0.9 // 0.98,
    }
    this.x = 150
    this.y = this.boxHeight - 50
    this.bullets = []

    this.text = 'C'
    this.color = Contracts.COLOR_HERO
    this.damage = 0
    this.candyMap = [...'CANDY'].reduce((p, c) => ({ ...p, [c]: false }), {})
  }

  tick () {
    return (Math.floor(Date.now() / 1000) % 30)
  }

  updateKeyEvent (key, value) {
    this.props.keys[key] = value
  }

  getBullets () {
    return this.bullets
  }

  setDemoMode (demoMode) {
    this.demoMode = demoMode
    return this
  }

  addText (text) {
    // FIXME to be better...
    [...`${this.text}${text}`]
      .forEach(c => this.candyMap[c] = true)
    this.text = Object.keys(this.candyMap).filter(c => this.candyMap[c]).join('')
  }

  fire (ctx, x, y) {
    // console.log('fire:', x, y)
    this.bullets.push(new Bullet(ctx, x, y))
  }

  drawHero (ctx, x, virusBorderY) {

    ctx.font = `bold ${Contracts.FONT_SIZE_HERO}px ${Contracts.FONT_HERO}`
    ctx.fillStyle = this.color

    const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(this.text)

    this.w = Math.floor(width)
    this.h = Math.floor(actualBoundingBoxAscent) + Math.floor(actualBoundingBoxDescent)
    let y = Math.floor(virusBorderY) + this.h - 10
    if (y > this.boxHeight - 10) {
      y = this.boxHeight - 10
    }
    ctx.fillText(this.text, x, this.y)

    //S:debug
    // const font = ctx.font
    // ctx.save()
    // ctx.font = `10px serif`
    // ctx.fillStyle = Contracts.COLOR_HERO
    // ctx.fillText(`x:${this.x},y:${y},w:${this.w},h:${this.h}, font: ${font}`, this.x + 20, y + 20)
    // ctx.restore()
    //E:debug

    this.y = y
  }

  decreaseHealth () {
    this.damage++
    this.color = this.damageRange[this.damage]
    if (this.damage > this.maxDamage) {
      this.damage = this.maxDamage
      return false
    }
    return true
  }

  getDemoControl () {
    const ms = Date.now()
    const k = Math.floor(ms / 240) % 240 % 10
    const f = Math.floor(ms) % 10

    // if (f < 1) {
    //   console.log(ms, k, f)
    // }

    const xVelocity = (k > 6) ? -5 : 5
    const fired = f < 1

    return {
      xVelocity,
      fired
    }
  }

  show (virusBorderY) {
    let { keys, velocityX, velocityInterval, speed, friction } = this.props
    let ctx = this.ctx
    let x = this.x

    // leftArrow
    if (keys[Contracts.KEY_CODE_LEFT_ARROW]) {
      if (velocityX > -speed) {
        velocityX -= velocityInterval
      }
    }

    // rightArrow
    if (keys[Contracts.KEY_CODE_RIGHT_ARROW]) {
      if (velocityX < speed) {
        velocityX += velocityInterval
      }
    }

    //S: Control Demo
    if (this.demoMode) {
      const { xVelocity, fired } = this.getDemoControl()
      velocityX = xVelocity
      keys[Contracts.KEY_CODE_SPACEBAR] = fired
    }
    // E: Control Demo

    velocityX = Math.floor(velocityX) * friction
    x += velocityX

    // console.log('hero speed ', velocityX)

    if (x >= this.xLimit) {
      x = this.limitMargin
    } else if (x <= this.limitMargin - Math.floor(this.w / 2)) {
      x = this.xLimit
    }

    this.drawHero(ctx, x, virusBorderY)

    this.bullets = [...this.bullets].filter(bullet => bullet.fire(this.bulletIcon))

    // fire by spacebar
    if (keys[Contracts.KEY_CODE_SPACEBAR]) {
      const cText = ctx.measureText(this.text)
      // console.log(cText)
      keys[Contracts.KEY_CODE_SPACEBAR] = false
      this.fire(ctx, x + this.w / 2 + cText.actualBoundingBoxLeft, this.y - this.h - 32)
    }

    this.props = {
      ...this.props,
      keys,
      velocityX,
      speed,
      friction
    }

    this.ctx = ctx
    this.x = Math.floor(x)
  }

}

export default Hero
