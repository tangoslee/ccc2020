import Monster from '@/models/Monster'
import Contracts from '@/Contracts'

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
    'CNDY'.split('').forEach(ch => {
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
          // console.log('monster hit by bullet')
          return {
            event: Contracts.EVENT_BULLET_HIT_MONSTER,
            payload: { monster }
          }
        case monster.hitHero(this.hero):
          // console.log('monster hit the hero')
          return {
            event: Contracts.EVENT_MONSTER_HIT_HERO,
            payload: { monster }
          }
          break
        case monster.drop(virusBorderY):
          // console.log('monster dropped!')
          // this.increasePollutedArea()
          return {
            event: Contracts.EVENT_MONSTER_REACH_GROUND,
            payload: {}
          }
        // break
      }

    } // E: for loop
  } // E: run()

}

export default Monsters
