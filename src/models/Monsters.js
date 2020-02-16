import Monster from '@/models/Monster'
import Contracts from '@/Contracts'
import { SimpleStore } from '@/stores/simple-store'

class Monsters {
  constructor (hero = null) {
    this.monsters = []
    this.hero = hero
  }

  setHero (hero) {
    this.hero = hero
    return this
  }

  init () {
    // console.log('monsters init')
    // Create monsters
    this.monsters = []
    'CNDY'.split('').forEach(ch => {
      const monster = new Monster().setText(ch)
      this.monsters.push(monster)
    })
  }

  reset () {
    this.monsters.map(monster => monster.reset())
  }

  // Drop Monsters
  run () {
    const { virusBorderY } = SimpleStore.state
    // console.log('monsters', this.monsters.length)
    for (let monster of this.monsters) {
      monster.show()

      switch (true) {
        case monster.isHit(this.hero.getBullets()):
          // console.log('monster hit by bullet')
          SimpleStore.publish(Contracts.EVENT_BULLET_HIT_MONSTER, { monster })
          break
        case monster.hitHero(this.hero):
          // console.log('monster hit the hero')
          SimpleStore.publish(Contracts.EVENT_MONSTER_HIT_HERO, { monster })
          break
        case monster.drop(virusBorderY):
          // console.log('monster dropped!')
          SimpleStore.publish(Contracts.EVENT_MONSTER_REACH_GROUND)
          break
      }

    } // E: for loop
  } // E: run()

}

export default Monsters
