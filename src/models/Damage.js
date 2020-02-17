import Contracts from '@/Contracts'

class Damage {
  constructor (type = Contracts.HERO, initDamage = 0) {

    this.maxDamage = 14
    this.initDamage = Math.floor(initDamage)
    this.value = this.initDamage
  }

  reset () {
    this.value = this.initDamage
  }

  static color (value) {
    const colorMap = {
      damage0: Contracts.COLOR_HERO,
      damage1: '#ecb701',
      damage2: '#d9a801',
      damage3: '#c59901',
      damage4: '#b28a01',
      damage5: '#9e7a01',
      damage6: '#8b6b01',
      damage7: '#775c00',
      damage8: '#644d00',
      damage9: '#503e00',
      damage10: '#3d2f00',
      damage11: '#292000',
      damage12: '#161100',
      damage13: '#020200'
    }
    return colorMap[`damage${value}`]
  }

  static font (value) {
    if (value >= 11) return 'Nosifer'
    if (value >= 9) return 'Eater'
    if (value >= 7) return 'Frijole'
    if (value >= 5) return 'Freckle Face'
    if (value >= 3) return 'Homemade Apple'
    if (value >= 1) return 'Lacquer'

    return Contracts.FONT_HERO
  }

  get style () {
    return {
      font: Damage.font(this.value),
      color: Damage.color(this.value)
    }
  }

  decrease (val = 1) {
    this.value -= Math.floor(val)
    if (this.value < 0) {
      this.value = 0
    }
  }

  increase (val = 1) {
    this.value += Math.floor(val)
    if (this.value > this.maxDamage) {
      this.value = this.maxDamage
    }
  }
}

export default Damage
/**
 * @example
 *
 * const damange = new Damange(Contracts.HERO)
 *
 */
