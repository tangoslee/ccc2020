import Monster from '@/models/Monster'
import Contracts from '@/Contracts'
import { SimpleStore } from '@/stores/simple-store'
// import { shuffle } from '@/helpers/Util'
//
// const letters = 'CANDYABCDEFGHIJKLMNOPQRSTUVWXYZ'

class Monsters {
  constructor (hero = null) {
    this.monsters = []
    this.hero = hero
    this.timer = null
  }

  random (min, max) {
    return Math.floor(Math.random() * max) + min
  }

  setHero (hero) {
    this.hero = hero
    return this
  }

  init () {
    // console.log('monsters init')

    // Create monsters
    this.monsters = []
    'CNDYVRUS'.split('')
      .forEach(ch => {
        const monster = new Monster().setText(ch)
        this.monsters.push(monster)
      })
    this.timer = null
  }

  reset () {
    this.monsters.map(monster => monster.reset())
  }

  // Drop Monsters
  run (timestamp) {
    const { virusBorderY } = SimpleStore.state
    if (!this.timer) {
      this.timer = timestamp
    }
    const timeSeq = Math.floor(timestamp - this.timer)

    // console.log('monsters', this.monsters.length)
    for (let monster of this.monsters) {
      monster.show(timeSeq)

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
