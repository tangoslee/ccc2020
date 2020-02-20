// @from https://stackoverflow.com/questions/10962379/how-to-check-intersection-between-2-rotated-rectangles

class Position {

  /**
   *
   * @param number x
   * @param number y
   */
  constructor (x = null, y = null) {
    this._x = x
    this._y = y
  }

  get x () { return this._x }

  set x (value) { this._x = value }

  get y () { return this._y }

  set y (value) { this._y = value }
}

class Polygon {
  // private _positions: Array<Position>;

  /**
   *
   * @param Array<Position> positions
   */
  constructor (positions = null) {
    this._positions = positions
  }

  /**
   *
   * @param Position position
   */
  addPosition (position) {
    if (!position) {
      return
    }

    if (!this._positions) {
      this._positions = []
    }

    this._positions.push(position)
  }

  /**
   *
   * @returns ReadonlyArray<Position>
   */
  get positions () { return this._positions }

  /**
   * https://stackoverflow.com/a/12414951/468910
   *
   * Helper function to determine whether there is an intersection between the two polygons described
   * by the lists of vertices. Uses the Separating Axis Theorem
   *
   * @param Polygon polygonToCompare a polygon to compare with
   * @param boolean allowTouch consider it an intersection when polygons only "touch"
   * @return boolean true if there is any intersection between the 2 polygons, false otherwise
   */
  isIntersecting (polygonToCompare, allowTouch = true) {
    // Array<ReadonlyArray<Position>> ploygons
    const polygons = [this.positions, polygonToCompare.positions]

    // ReadonlyArray<Position> firstPolygonPositions, secondPolygonPositions
    const firstPolygonPositions = polygons[0]
    const secondPolygonPositions = polygons[1]

    let minA, maxA, projected, i, i1, j, minB, maxB

    for (i = 0; i < polygons.length; i++) {

      // for each polygon, look at each edge of the polygon, and determine if it separates
      // the two shapes
      const polygon = polygons[i]
      for (i1 = 0; i1 < polygon.length; i1++) {

        // grab 2 vertices to create an edge
        const i2 = (i1 + 1) % polygon.length
        const p1 = polygon[i1]
        const p2 = polygon[i2]

        // find the line perpendicular to this edge
        const normal = {
          x: p2.y - p1.y,
          y: p1.x - p2.x
        }

        minA = maxA = undefined
        // for each vertex in the first shape, project it onto the line perpendicular to the edge
        // and keep track of the min and max of these values
        for (j = 0; j < firstPolygonPositions.length; j++) {
          projected = normal.x * firstPolygonPositions[j].x + normal.y * firstPolygonPositions[j].y

          if (!minA || projected < minA || (!allowTouch && projected === minA)) {
            minA = projected
          }

          if (!maxA || projected > maxA || (!allowTouch && projected === maxA)) {
            maxA = projected
          }
        }

        // for each vertex in the second shape, project it onto the line perpendicular to the edge
        // and keep track of the min and max of these values
        minB = maxB = undefined
        for (j = 0; j < secondPolygonPositions.length; j++) {
          projected = normal.x * secondPolygonPositions[j].x + normal.y * secondPolygonPositions[j].y

          if (!minB || projected < minB || (!allowTouch && projected === minB)) {
            minB = projected
          }

          if (!maxB || projected > maxB || (!allowTouch && projected === maxB)) {
            maxB = projected
          }
        }

        // if there is no overlap between the projects, the edge we are looking at separates the two
        // polygons, and we know there is no overlap
        if (maxA < minB || (!allowTouch && maxA === minB) || maxB < minA || (!allowTouch && maxB === minA)) {
          return false
        }
      }
    }

    return true
  }
}

export {
  Polygon,
  Position
}
