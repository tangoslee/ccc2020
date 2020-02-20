import Contracts from '@/Contracts'
import { SimpleStore } from '@/stores/simple-store'
import Damage from '@/models/Damage'
import Hero from '@/models/Hero'
import Avengers from '@/models/Avengers'
import { Polygon, Position } from '@/helpers/Util'

class Monster {
  constructor () {
    const { ctx, width, height } = SimpleStore.state
    // console.log('monster created')

    this.ctx = ctx
    this.width = width
    this.height = height

    this.initY = -this.random(0, 500)
    this.friction = 0.5
    this.angle = 0
    this.isRotate = this.random(0, 10) % 3 === 0
    this.reset()

  }

  reset () {
    // console.log('reset monster')
    const { gameCfg } = SimpleStore.state
    const fonts = [
      'Lacquer',
      'Eater',
      'Homemade Apple',
      'Freckle Face',
      'Frijole',
      'Nosifer'
    ]
    this.angle = 0
    this.velocityY = 0
    this.speed = this.random(gameCfg.monsterSpeedMin, gameCfg.monsterSpeedMax)
    this.x = this.random(100, (this.width - 200))
    this.size = Math.round(this.random(gameCfg.monsterFontSizeMin, gameCfg.monsterFontSizeMax))
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

  show (timeSeq) {
    const { debug, ctx, width, height } = SimpleStore.state
    // font-family: 'Lacquer', sans-serif;
    // font-family: 'Eater', cursive;
    // font-family: 'Homemade Apple', cursive;
    // font-family: 'Freckle Face', cursive;
    // font-family: 'Frijole', cursive;
    // font-family: 'Nosifer', cursive;

    // const fps = (this.oldSeq === null) ? 0 : timeSeq - this.oldSeq
    // this.oldSeq = timeSeq

    // console.log('timeSeq: ', timeSeq % 360)
    const degree = timeSeq % 360

    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline
    // ctx.textBaseline = "top" || "hanging" || "middle" || "alphabetic" || "ideographic" || "bottom";
    if (this.release) {

      ctx.fillStyle = Contracts.COLOR_HERO
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(this.text, this.x, this.y)
    } else {
      if (debug) {
        ctx.font = `10px serif`
        ctx.fillStyle = Contracts.COLOR_MONSTER
        ctx.fillText(`x:${this.x},y:${this.y},w:${this.w},h:${this.h}`, this.x + 20, this.y + 20)
      }

      ctx.font = `bold ${this.size}px ${this.font}`
      ctx.fillStyle = this.color
      ctx.textBaseline = 'alphabetic'

      if (this.isRotate) {
        ctx.save()
        // ctx.translate(this.x + this.w / 2, this.y + this.h / 2)
        ctx.translate(this.x - this.w / 2, this.y - this.h / 2)
        ctx.rotate(this.angle)
        ctx.fillText(this.text, -(this.w / 2), -(this.h / 2))
        ctx.restore()
        // this.angle += (Math.PI * 2) / 30
        this.angle += (Math.PI / 180)
      } else {
        ctx.fillText(this.text, this.x, this.y)
      }
    }

    const { width: textWidth, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(this.text)
    this.w = Math.floor(textWidth)
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

    const a = new Polygon(new Position(x, y))
    const b = new Polygon(new Position(target.x, target.y))

    // return a.isIntersecting(b)

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
