import Monster from '@/models/Monster'

class Monsters {
  constructor () {
    this.monsters = []
    this.hero = null
  }

  setHero (hero) {
    this.hero = hero
    return this
  }

  init (ctx, width, height) {
    // Create monsters
    this.monsters = []
    'ANDY'.split('').forEach(ch => {
      const monster = new Monster(ctx, width, height).setText(ch)
      this.monsters.push(monster)
    })
  }

  reset () {
    this.monsters.map(monster => monster.reset())
  }

  // Drop Monsters
  async run (virusBorderY) {
    // console.log('monsters', this.monsters.length)
    for (let monster of this.monsters) {
      monster.show()

      switch (true) {
        case monster.isHit(this.hero.getBullets()):
          console.log('monster hit by bullet')
          // this.hitScore += this.hitScoreInterval
          monster.transformToHero(this.hero)
          // this.decreasePollutedArea()
          return {
            callback: 'decreasePollutedArea',
            value: null
          }
        // return info
        // break
        case monster.hitHero(this.hero):
          monster.reset()
          if (this.hero.decreaseHealth()) {
            // this.increasePollutedArea(0.1)
            return {
              callback: 'increasePollutedArea',
              value: 0.1
            }
          } else {
            // gameOver
            // TODO throw exception
            // this.lostGame()
            return {
              callback: 'lostGame',
              value: null
            }
          }
          break
        case monster.drop(virusBorderY):
          console.log('monster dropped!')
          // this.increasePollutedArea()
          return {
            callback: 'increasePollutedArea',
            value: null
          }
        // break
      }

    } // E: for loop
  } // E: run()

}

export default Monsters
