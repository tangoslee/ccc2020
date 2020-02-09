import Bullet from '@/models/bullet'
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

    this.reset()
  }

  reset () {
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

  updateKeyEvent (key, value) {
    this.props.keys[key] = value
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
    this.bullets.push(new Bullet(ctx, x, y))
  }

  drawHero (ctx, x, y) {
    ctx.font = `bold ${Contracts.FONT_SIZE_HERO}px ${Contracts.FONT_HERO}`
    ctx.fillStyle = this.color

    const cText = ctx.measureText(this.text)
    this.w = cText.width
    this.h = cText.actualBoundingBoxAscent + cText.actualBoundingBoxDescent

    ctx.fillText(this.text, x, y)
  }

  decreaseHealth () {
    this.damage++
    this.color = this.damageRange[this.damage]
    if (this.damage > 10) {
      this.damage = 10
      return false
    }
    return true
  }

  show (pollutedY) {
    let { keys, velocityX, velocityInterval, speed, friction } = this.props
    let ctx = this.ctx
    let x = this.x

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

    velocityX = Math.floor(velocityX) * friction
    x += velocityX

    // console.log(velocityX)

    if (x >= this.xLimit) {
      x = this.limitMargin
    } else if (x <= this.limitMargin) {
      x = this.xLimit
    }

    const floatingY = Math.floor(pollutedY) + this.h
    const boxY = Math.floor(this.boxHeight)
    const fixedY = floatingY > boxY ? boxY : floatingY

    this.drawHero(ctx, x, fixedY)

    this.bullets = [...this.bullets].filter(bullet => bullet.fire(this.bulletIcon))

    // fire by spacebar
    if (keys[32]) {
      const cText = ctx.measureText(this.text)
      // console.log(cText)
      keys[32] = false
      this.fire(ctx, x + this.w / 2 + cText.actualBoundingBoxLeft, fixedY - this.h - 32)
    }

    this.props = {
      ...this.props,
      keys,
      velocityX,
      speed,
      friction
    }

    this.ctx = ctx
    this.x = x
  }

}

export default Hero
