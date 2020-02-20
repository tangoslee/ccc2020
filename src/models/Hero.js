import { SimpleStore } from '@/stores/simple-store'
import Bullet from '@/models/Bullet'
import Contracts from '@/Contracts'
import Damage from '@/models/Damage'

class Hero {

  constructor (initText = 'A', initX = 0) {
    // console.log('hero created', { initText, initX })
    this.initX = initX
    this.limitMargin = 5
    this.damage = new Damage(Contracts.HERO)

    this.isLeader = false
    this.text = initText
    this.initText = initText
    this.reset()
  }

  reset () {
    // console.log('reset hero:', this.id)
    const { height, ctx } = SimpleStore.state

    this.x = this.initX
    this.y = height - 50
    this.w = 0
    this.bullets = []
    this.shiftX = 0

    this.text = this.initText
    this.color = Contracts.COLOR_HERO
    this.font = Contracts.FONT_HERO
    this.damage.reset()

    return this
  }

  get id () {
    return this.text
  }

  get crewSaved () {
    return this.text.length - 1
  }

  get isAlive () {
    return this.damage.value < this.damage.maxDamage
  }

  setLeader () {
    this.isLeader = true
    return this
  }

  setShiftX (val) {
    this.shiftX = val
    // console.log(`shiftX of ${this.id}: shiftX:${val}, x:${this.x} -> ${this.x + val}`)
    return this
  }

  fire () {
    const { ctx, height, bulletIcon, virusBorderY } = SimpleStore.state
    const cText = ctx.measureText(this.text)
    // console.log(cText)
    const bulletX = this.x + this.w / 2 + cText.actualBoundingBoxLeft
    const bulletY = this.y - 10
    // console.log('fire:', this.id, bulletX, bulletY, 'x:', this.x, ', height:', height)
    this.bullets.push(new Bullet(ctx, bulletX, bulletY, height, bulletIcon))
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline
   * //ctx.textBaseline = "top" || "hanging" || "middle" || "alphabetic" || "ideographic" || "bottom";
   * @param x
   */
  drawHero (x, y) {

    const { ctx, debug, width, height, gameCfg } = SimpleStore.state
    ctx.font = `bold ${gameCfg.heroFontSize}px ${this.font}`
    ctx.fillStyle = this.color

    const { width: textWidth, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(this.text)
    this.w = Math.floor(textWidth)
    this.h = Math.floor(actualBoundingBoxAscent) + Math.floor(actualBoundingBoxDescent)

    let offsetY = Math.floor(y) - Math.floor(this.h / 5) // 10% above on the borderY
    if (offsetY + this.h > height) {
      offsetY = height - this.h
    }

    x += Math.floor(this.shiftX)
    // console.log('drawHero', { id: this.id, x, y: this.y })
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
    this.x = x
    this.y = offsetY
  }

  decreaseHealth () {
    const { god } = SimpleStore.state
    if (god) {
      return true
    }
    const damage = this.isLeader ? 1 : Math.floor(this.damage.maxDamage / 2)
    this.damage.increase(damage)
    const { color, font } = this.damage.style
    this.color = color
    this.font = font
    return this.isAlive
  }

}

export default Hero
