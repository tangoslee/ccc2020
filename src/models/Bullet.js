import Contracts from '@/Contracts'
import { SimpleStore } from '@/stores/simple-store'

class Bullet {
  constructor (ctx, x, y, height, icon) {
    // console.log('bullet created', icon)

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
    this.icon = icon
    this.reset()
  }

  reset () {
    // console.log('reset bullet')
    this.speed = 10
    this.distance = 0
    this.y = Math.floor(this.initY)
    this.offsetY = this.y
  }

  clear () {
    this.distance = this.distanceLimit
  }

  fire () {
    const { debug, ctx } = SimpleStore.state
    // console.log('drop:', this.y, ' >= ', limit, this.positionY >= limit)
    if (this.distance < this.distanceLimit && this.y > this.marginTop) {

      if (debug) {
        ctx.font = `10px serif`
        ctx.fillStyle = Contracts.COLOR_MONSTER
        ctx.fillText(`x:${this.x},y:${this.y},w:${this.w},h:${this.h}`, this.x, this.y)
      }
      // console.log('fire icon', this.icon)
      ctx.drawImage(this.icon, this.x, this.y, this.w, this.h)

      let velocityY = this.speed
      velocityY = Math.floor(velocityY) * this.friction
      this.y -= velocityY
      this.distance = Math.floor(this.offsetY - this.y)

      // console.log({ 'bullet speed ': velocityY, distance: this.distance, dLimit: this.distanceLimit, y: this.y })

      return true
    }
    return false
  }

}

export default Bullet
