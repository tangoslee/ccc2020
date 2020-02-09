import Contracts from '@/Contracts'

class Monster {
  constructor (ctx, width, height) {
    // console.log('monster created')

    this.ctx = ctx
    this.width = width
    this.height = height + 100 // + 115

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
    this.size = Math.round(this.random(50, 160))
    this.font = fonts[this.random(0, fonts.length - 1)]
    this.y = Math.floor(this.initY)
  }

  random (min, max) {
    return Math.floor(Math.random() * max) + min
  }

  setText (text) {
    this.text = text
    return this
  }

  show () {
    // font-family: 'Lacquer', sans-serif;
    // font-family: 'Eater', cursive;
    // font-family: 'Homemade Apple', cursive;
    // font-family: 'Freckle Face', cursive;
    // font-family: 'Frijole', cursive;
    // font-family: 'Nosifer', cursive;

    this.ctx.font = `bold ${this.size}px ${this.font}`
    this.ctx.fillStyle = Contracts.COLOR_MONSTER
    this.ctx.fillText(this.text, this.x, this.y)
    const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } = this.ctx.measureText(this.text)
    this.w = width
    this.h = actualBoundingBoxAscent + actualBoundingBoxDescent
  }

  drop (limit = this.height) {
    // this.velocityY = this.speed
    this.velocityY = this.random(Math.max(1, this.speed - 5), this.speed + 5)
    this.velocityY = Math.floor(this.velocityY) * this.friction
    this.y += this.velocityY

    // console.log('drop:', this.y, ' >= ', limit, this.y >= limit)
    if (this.y >= limit) {
      return true
    }
    return false
  }

  isOverlapping (bullet) {
    return !(bullet.x > (this.x + this.w) ||
      (bullet.x + bullet.w) < this.x ||
      bullet.y > (this.y + this.h) ||
      (bullet.y + bullet.h) < this.y)
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
    if (this.isOverlapping(hero)) {
      // console.log('hit hero')
      return true
    }
    return false
  }

}

export default Monster
