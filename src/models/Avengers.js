import { SimpleStore } from '@/stores/simple-store'
import Contracts from '@/Contracts'

class Avengers {
  constructor (leader) {

    this.heroMap = {}
    this.members = 'CANDY'
    this.memberMap = [...this.members].reduce((p, c) => ({ ...p, [c]: -1 }), {})
    this.limitMargin = 5

    if (!leader) {
      throw new Error('leader(hero) is required. new Hero()')
    }
    this.join(leader)
    this.leader = leader.setLeader()

    this.initProps()
    SimpleStore.subscribe(Contracts.KEY_DOWN_EVENT, ({ keyCode }) => {
      this.props.keys[keyCode] = true
    })

    SimpleStore.subscribe(Contracts.KEY_UP_EVENT, ({ keyCode }) => {
      this.props.keys[keyCode] = false
    })
  }

  // S: Hero Methods

  get damage () {
    return this.leader.damage
  }

  get crewSaved () {
    return this.heros.length - 1
  }

  get bullets () {
    return this.heros.reduce((p, c) => ([...p, ...c.bullets]), [])
  }

  initProps () {
    const { gameCfg } = SimpleStore.state
    this.props = {
      keys: [],
      velocityX: 0,
      velocityInterval: 5,
      speed: gameCfg.heroSpeed,
      friction: 0.9 // 0.98,
    }
  }

  reset () {
    const { height } = SimpleStore.state
    // reset Avengers
    this.x = 0
    this.y = this.y = height - 50
    this.demoTimer = null
    this.demoReverseDirection = false
    this.heroMap = { [this.leader.id]: this.leader }
    this.memberMap = [...this.members].reduce((p, c) => ({ ...p, [c]: -1 }), {})
    this.initProps()

    // reset heroes
    this.heros.forEach(hero => {
      if (hero.isLeader) {
        hero.reset()
      } else {
        delete this.heroMap[hero.id]
      }
    })
  }

  fire (ctx, x, y) {
    this.heros.forEach(hero => hero.fire(ctx, x, y))
  }

  run (timestamp) {
    // this.heros.forEach(hero => hero.run(timestamp))
    this.show(timestamp)
  }

  // E: Hero Methods

  // S: Avengers
  get leaderX () {
    return this.leader.x
  }

  get w () {
    return Object.keys(this.heroMap).reduce((p, k) => (p + this.heroMap[k].w), 0)
  }

  set w (val) {
    console.log('set w:', val)
  }

  get text () {
    return Object.keys(this.heroMap).reduce((p, k) => (p + this.heroMap[k].text), '')
  }

  get heros () {
    return Object.values(this.heroMap)
  }

  relocate () {
    const { gameCfg } = SimpleStore.state
    // console.log('relocate', { gameCfg })
    this.heros
      .sort((a, b) => (this.members.indexOf(a.id) - this.members.indexOf(b.id)))
      .reduce((offsetX, hero) => {
        offsetX += (hero.w || gameCfg.heroFontSize)
        // console.log(hero.id, hero.w, offsetX)
        hero.setShiftX(offsetX)
        return offsetX
      }, 0)
  }

  join (hero) {
    if (this.memberMap[hero.id] && this.memberMap[hero.id] === -1) {
      this.memberMap[hero.id] = 1
      // console.log('join', hero.id)

      this.heroMap[hero.id] = hero.reset()
      this.relocate()
      return true
    }
    return false
  }

  leave (hero) {
    this.memberMap[hero.id] = -1
    delete this.heroMap[hero.id]
    this.relocate()
  }

  getDemoControl (timestamp, width, x, leftLimit, rightLimit) {
    if (this.demoTimer === null) {
      this.demoTimer = {
        diff: timestamp - (new Date(timestamp)).getMilliseconds()
      }
    }
    const { diff } = this.demoTimer
    const seconds = (new Date(timestamp - diff)).getSeconds()
    // const seconds = (new Date(timestamp - diff)).getMilliseconds()
    // console.log('demo', seconds)
    const ms = Date.now()
    const k = Math.floor(ms / 240) % 240 % 10
    const f = Math.floor(ms) % 10
    let xVelocity = (k > 6) ? -5 : 5
    const fired = f < 1

    if (x <= leftLimit) {
      this.demoReverseDirection = false
    } else if (x >= rightLimit) {
      this.demoReverseDirection = true
    }

    if (this.demoReverseDirection) {
      xVelocity = -xVelocity
    }

    return {
      xVelocity,
      fired
    }
  }

  show (timestamp) {
    const { demoMode, ctx, width, virusBorderY } = SimpleStore.state
    let { keys, velocityX, velocityInterval, speed, friction } = this.props

    let x = this.x

    // leftArrow
    if (keys[Contracts.KEY_CODE_LEFT_ARROW]) {
      // console.log('show leftArrow', { velocityX, speed: -speed })
      if (velocityX > -speed) {
        velocityX -= velocityInterval
      }
    }

    // rightArrow
    if (keys[Contracts.KEY_CODE_RIGHT_ARROW]) {
      // console.log('show rightArrow', { velocityX, speed: -speed })
      if (velocityX < speed) {
        velocityX += velocityInterval
      }
    }

    const leftLimit = this.limitMargin
    const rightLimit = Math.floor(width - this.w - this.limitMargin)

    //S: Control Demo
    if (demoMode) {
      const { xVelocity, fired } = this.getDemoControl(timestamp, width, x, leftLimit, rightLimit)
      velocityX = xVelocity
      keys[Contracts.KEY_CODE_SPACEBAR] = fired
    }
    // E: Control Demo

    velocityX = Math.floor(velocityX) * friction
    x += velocityX

    if (x <= leftLimit) {
      x = leftLimit
    } else if (x >= rightLimit) {
      x = rightLimit
    }

    [...this.heros]
      .filter(hero => {
        if (!hero.isAlive) {
          this.leave(hero)
          return false
        }
        return true
      })
      .forEach(hero => {
        hero.drawHero(x, virusBorderY)
        hero.bullets = [...hero.bullets].filter(bullet => bullet.fire())
      })

    // fire by spacebar
    if (keys[Contracts.KEY_CODE_SPACEBAR]) {
      keys[Contracts.KEY_CODE_SPACEBAR] = false
      this.heros.forEach(hero => hero.fire())
    }

    this.props = {
      ...this.props,
      keys,
      velocityX,
      speed,
      friction
    }

    // this.ctx = ctx
    this.x = Math.floor(x)
  }

  // E: Avengers

}

export default Avengers
