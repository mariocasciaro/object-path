var Benchpress = require('@mariocasciaro/benchpress')
var benchmark = new Benchpress()
var op = require('./')

var testObj = {
  level1_a: {
    level2_a: {
      level3_a: {
        level4_a: {
        }
      }
    }
  }
}

benchmark
  .add('get existing', {
    iterations: 100000,
    fn: function() {
      op.get(testObj, ['level1_a', 'level2_a', 'level3_a', 'level4_a'])
    }
  })
  .add('get non-existing', {
    iterations: 100000,
    fn: function() {
      op.get(testObj, ['level5_a'])
    }
  })
  .add('push', {
    iterations: 100000,
    fn: function() {
      op.push(testObj, ['level1_a', 'level2_a', 'level3_a', 'level4_a', 'level5_a'], 'val')
    }
  })
  .run()
