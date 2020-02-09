class Monster {
  constructor (ctx, width, height) {
    console.log('item created')

    this.ctx = ctx
    this.width = width
    this.height = height + 100 // + 115

    this.initY = -this.random(0, 500)
    this.friction = 0.9
    this.reset()

  }

  reset () {
    console.log('reset monster')
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
    this.initX = this.random(100, (this.width - 200))
    this.size = Math.round(this.random(50, 160))
    this.font = fonts[this.random(0, fonts.length - 1)]
    this.positionY = Math.round(this.initY)
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
    this.ctx.fillStyle = '#000'
    this.ctx.fillText(this.text, this.initX, this.positionY)
  }

  drop (limit = this.height) {
    // this.velocityY = this.speed
    this.velocityY = this.random(Math.max(1, this.speed - 5), this.speed + 5)
    this.velocityY *= this.friction
    this.positionY += this.velocityY

    // console.log('drop:', this.positionY, ' >= ', limit, this.positionY >= limit)
    if (this.positionY >= limit) {
      return true
    }
    return false
  }

  setTimer (val) {
    this.timer = val
  }

  clearTimer () {
    window.clearTimeout(this.timer)
  }

}

export default Monster
