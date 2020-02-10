class Bullet {
  constructor (ctx, x, y) {
    // console.log('bullet created')

    this.ctx = ctx
    this.x = x
    this.initY = y
    this.friction = 0.9
    const size = 24
    this.w = size
    this.h = size
    this.marginTop = 100
    this.reset()
  }

  reset () {
    // console.log('reset bullet')
    this.velocityY = 0
    this.speed = 10
    this.y = Math.floor(this.initY)
  }

  clear () {
    this.y = this.marginTop
  }

  fire (icon) {
    // console.log('drop:', this.y, ' >= ', limit, this.positionY >= limit)
    if (this.y > this.marginTop) {
      this.ctx.drawImage(icon, this.x, this.y, this.w, this.h)

      this.velocityY = this.speed
      this.velocityY *= this.friction
      this.y -= this.velocityY
      return true
    }
    return false
  }

}

export default Bullet
