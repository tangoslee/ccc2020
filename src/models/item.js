class Item {
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
    this.velocityY = 0
    this.speed = this.random(1, 20)
    this.initX = this.random(100, (this.width - 200))
    this.size = Math.round(this.random(50, 160))
    this.positionY = this.initY
  }

  random (min, max) {
    return Math.floor(Math.random() * max) + min
  }

  setText (text) {
    this.text = text
    return this
  }

  show () {
    this.ctx.font = `bold ${this.size}px sans-serif`
    this.ctx.fillStyle = '#000'
    this.ctx.fillText(this.text, this.initX, this.positionY)
  }

  drop () {
    // console.log('drop')
    this.velocityY = this.random(Math.max(1, this.speed - 2), this.speed + 2)
    this.velocityY *= this.friction
    this.positionY += this.velocityY

    if (this.positionY >= this.height) {
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

export default Item
