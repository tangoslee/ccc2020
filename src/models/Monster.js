import Contracts from '@/Contracts'
import { SimpleStore } from '@/stores/simple-store'
import Damage from '@/models/Damage'
import Hero from '@/models/Hero'
import Avengers from '@/models/Avengers'

class Monster {
  constructor () {
    const { ctx, width, height } = SimpleStore.state
    // console.log('monster created')

    this.ctx = ctx
    this.width = width
    this.height = height

    this.initY = -this.random(0, 500)
    this.friction = 0.9
    this.reset()

  }

  reset () {
    // console.log('reset monster')
    const fonts = [
      'Lacquer',
      'Eater',
      'Homemade Apple',
      'Freckle Face',
      'Frijole',
      'Nosifer'
    ]
    this.velocityY = 0
    this.speed = this.random(1, 10)
    this.x = this.random(100, (this.width - 200))
    this.size = Math.round(this.random(50, 96))
    this.font = fonts[this.random(0, fonts.length - 1)]
    this.color = Contracts.COLOR_MONSTER
    this.y = Math.floor(this.initY)
    this.release = false
    this.damage = new Damage(Contracts.MONSTER, this.random(3, 14))
  }

  random (min, max) {
    return Math.floor(Math.random() * max) + min
  }

  setText (text) {
    this.text = text
    return this
  }

  isCured () {
    return this.damage.value === 0
  }

  cure () {
    this.damage.decrease()
    const { color, font } = this.damage.style
    this.color = color
    this.font = font
    return this.isCured()
  }

  show () {
    const { debug } = SimpleStore.state
    // font-family: 'Lacquer', sans-serif;
    // font-family: 'Eater', cursive;
    // font-family: 'Homemade Apple', cursive;
    // font-family: 'Freckle Face', cursive;
    // font-family: 'Frijole', cursive;
    // font-family: 'Nosifer', cursive;

    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline
    // ctx.textBaseline = "top" || "hanging" || "middle" || "alphabetic" || "ideographic" || "bottom";
    if (this.release) {
      // this.ctx.font = `bold ${Contracts.FONT_SIZE_HERO}px ${Contracts.FONT_HERO}`
      // this.ctx.save()
      this.ctx.fillStyle = Contracts.COLOR_HERO
      // this.ctx.rotate(90 * Math.PI / 180)
      this.ctx.textBaseline = 'alphabetic'
      this.ctx.fillText(this.text, this.x, this.y)
      // this.ctx.restore()
    } else {
      if (debug) {
        this.ctx.font = `10px serif`
        this.ctx.fillStyle = Contracts.COLOR_MONSTER
        this.ctx.fillText(`x:${this.x},y:${this.y},w:${this.w},h:${this.h}`, this.x + 20, this.y + 20)
      }

      this.ctx.font = `bold ${this.size}px ${this.font}`
      this.ctx.fillStyle = this.color
      this.ctx.textBaseline = 'alphabetic'
      this.ctx.fillText(this.text, this.x, this.y)

    }

    const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } = this.ctx.measureText(this.text)
    this.w = Math.floor(width)
    this.h = Math.floor(actualBoundingBoxAscent) + actualBoundingBoxDescent
  }

  drop (limit) {
    // this.velocityY = this.speed
    this.velocityY = this.random(Math.max(1, this.speed - 5), this.speed + 4)
    this.velocityY = Math.floor(this.velocityY) * this.friction
    this.y = Math.floor(this.y) + this.velocityY

    // console.log('monster speed', this.velocityY)
    const y = Math.floor(this.y - this.h / 5)
    // console.log('drop:', y, ' >= ', limit, this.y >= limit)
    if (y >= limit) {
      const release = this.release
      this.reset()
      return !release
    }
    return false
  }

  isOverlapping (target) {
    const x = Math.floor(this.x)
    const y = Math.floor(this.y)
    const w = Math.floor(this.w)
    const h = Math.floor(this.h)

    // const { debug } = SimpleStore.state
    // if (debug) {
    //   const { x: tx, y: ty, w: tw, h: th } = target
    //   console.log({
    //     monster: { x, y, w, h },
    //     target: { tx, ty, tw, th }
    //   })
    //
    //   console.log({
    //     release: this.release,
    //     'x > target.x + target.w': x > target.x + target.w,
    //     'x + w < target.x': x + w < target.x,
    //     'y < target.y': y < target.y,
    //     'y - h > target.y + target.h': y - h > target.y + target.h
    //   })
    // }

    return !this.release &&
      !(
        x > target.x + target.w ||
        x + w < target.x ||
        y < target.y ||
        y - h > target.y + target.h
      )

  }

  isHit (bullets) {
    for (let bullet of bullets) {
      if (this.isOverlapping(bullet)) {
        // console.log('hit monster')
        bullet.clear()
        return true
      }
    }
    return false
  }

  hitHero (hero) {
    const heros = (hero instanceof Avengers) ? hero.heros : [hero]
    for (let hero of heros) {
      if (this.isOverlapping(hero)) {
        // console.log('hit hero')
        return hero
      }
    }
    return false
  }

  transformToHero (hero) {
    this.release = true
    this.speed = 50
    if (hero instanceof Avengers) {
      hero.join(new Hero(this.text, hero.leaderX))
    }
  }

}

export default Monster
