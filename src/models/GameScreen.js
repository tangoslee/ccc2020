import Contracts from '@/Contracts'

class GameScreen {

  constructor (ctx, width, height) {
    this.ctx = ctx
    this.width = width
    this.height = height
  }

  drawCleanZone (y) {
    this.ctx.fillStyle = Contracts.COLOR_CLEAN_ZONE
    this.ctx.fillRect(0, 0, this.width, y)
  }

  drawPollutionZone (y) {
    this.ctx.fillStyle = Contracts.COLOR_POLLUTION_ZONE
    this.ctx.fillRect(0, y, this.width, this.height)
  }

}

export default GameScreen
