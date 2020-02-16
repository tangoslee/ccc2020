import Contracts from '@/Contracts'

class Bullet {
  constructor (ctx, x, y, height) {
    // console.log('bullet created')

    this.ctx = ctx
    this.x = x
    this.initY = y
    this.friction = 0.9
    const size = 24
    this.w = size
    this.h = size
    this.distanceLimit = Math.floor(height * 0.75)
    this.marginTop = 10
    this.distance = 0
    this.offsetY = 0
    this.reset()
  }

  reset () {
    // console.log('reset bullet')
    this.velocityY = 0
    this.speed = 10
    this.distance = 0
    this.y = Math.floor(this.initY)
    this.offsetY = this.y
  }

  clear () {
    this.distance = this.distanceLimit
  }

  fire (icon) {
    // console.log('drop:', this.y, ' >= ', limit, this.positionY >= limit)
    if (this.distance < this.distanceLimit && this.y > this.marginTop) {

      // //s:debug
      // this.ctx.font = `10px serif`
      // this.ctx.fillStyle = Contracts.COLOR_MONSTER
      // this.ctx.fillText(`x:${this.x},y:${this.y},w:${this.w},h:${this.h}`, this.x + 20, this.y + 20)
      // //e: debug

      this.ctx.drawImage(icon, this.x, this.y, this.w, this.h)

      this.velocityY = this.speed
      this.velocityY = Math.floor(this.velocityY) * this.friction
      this.y -= this.velocityY
      this.distance = Math.floor(this.offsetY - this.y)

      // console.log({ 'bullet speed ': this.velocityY, distance: this.distance, dLimit: this.distanceLimit, y: this.y })

      return true
    }
    return false
  }

}

export default Bullet
