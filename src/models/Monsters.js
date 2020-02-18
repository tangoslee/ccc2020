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

      if (monster.isHit(this.hero.bullets)) {
        // console.log('monster hit by bullet')
        SimpleStore.publish(Contracts.EVENT_BULLET_HIT_MONSTER, { monster })
        return
      }
      const hero = monster.hitHero(this.hero)
      if (hero) {
        // console.log('monster hit the hero')
        SimpleStore.publish(Contracts.EVENT_MONSTER_HIT_HERO, { monster, hero })
        return
      }
      if (monster.drop(virusBorderY)) {
        // console.log('monster dropped!')
        SimpleStore.publish(Contracts.EVENT_MONSTER_REACH_GROUND)
        return
      }
    } // E: for loop
  } // E: run()

}

export default Monsters
