var expect = require('chai').expect,
  objectPath = require('./index.js');


function getTestObj() {
  return {
    a: "b",
    b: {
      c: [],
      d: ["a", "b"],
      e: [{},{f: "g"}],
      f: "i"
    }
  };
}

describe('get', function() {
  it('should return the value under shallow object', function() {
    var obj = getTestObj();
    expect(objectPath.get(obj, "a")).to.be.equal("b");
    expect(objectPath.get(obj, ["a"])).to.be.equal("b");
  });

  it('should return the value under deep object', function() {
    var obj = getTestObj();
    expect(objectPath.get(obj, "b.f")).to.be.equal("i");
    expect(objectPath.get(obj, ["b","f"])).to.be.equal("i");
  });

  it('should return the value under array', function() {
    var obj = getTestObj();
    expect(objectPath.get(obj, "b.d.0")).to.be.equal("a");
    expect(objectPath.get(obj, ["b","d",0])).to.be.equal("a");
  });

  it('should return the value under array deep', function() {
    var obj = getTestObj();
    expect(objectPath.get(obj, "b.e.1.f")).to.be.equal("g");
    expect(objectPath.get(obj, ["b","e",1,"f"])).to.be.equal("g");
  });

  it('should return undefined for missing values under object', function() {
    var obj = getTestObj();
    expect(objectPath.get(obj, "a.b")).to.not.exist;
    expect(objectPath.get(obj, ["a","b"])).to.not.exist;
  });

  it('should return undefined for missing values under array', function() {
    var obj = getTestObj();
    expect(objectPath.get(obj, "b.d.5")).to.not.exist;
    expect(objectPath.get(obj, ["b","d","5"])).to.not.exist;
  });

  it('should return the value under integer-like key', function() {
    var obj = { "1a": "foo" };
    expect(objectPath.get(obj, "1a")).to.be.equal("foo");
    expect(objectPath.get(obj, ["1a"])).to.be.equal("foo");
  });

  it('should return the default value when the key doesnt exist', function() {
    var obj = { "1a": "foo" };
    expect(objectPath.get(obj, "1b", null)).to.be.equal(null);
    expect(objectPath.get(obj, ["1b"], null)).to.be.equal(null);
  });

  it('should return the default value when path is empty', function() {
    var obj = { "1a": "foo" };
    expect(objectPath.get(obj, "", null)).to.be.deep.equal({ "1a": "foo" });
    expect(objectPath.get(obj, [])).to.be.deep.equal({ "1a": "foo" });
    expect(objectPath.get({  }, ["1"])).to.be.equal(undefined);
  });

  it('should skip non own properties with isEmpty', function(){
    var Base = function(enabled){ };
    Base.prototype = {
      one: {
        two: true
      }
    };
    var Extended = function(){
      Base.call(this,  true);
    };
    Extended.prototype = Object.create(Base.prototype);

    var extended = new Extended();

    expect(objectPath.get(extended, ['one','two'])).to.be.equal(undefined);
    extended.enabled = true;

    expect(objectPath.get(extended, 'enabled')).to.be.equal(true);
  });
});


describe('set', function() {
  it('should set value under shallow object', function() {
    var obj = getTestObj();
    objectPath.set(obj, "c", {m: "o"});
    expect(obj).to.have.deep.property("c.m", "o");
    obj = getTestObj();
    objectPath.set(obj, ["c"], {m: "o"});
    expect(obj).to.have.deep.property("c.m", "o");
  });

  it('should set value under deep object', function() {
    var obj = getTestObj();
    objectPath.set(obj, "b.c", "o");
    expect(obj).to.have.deep.property("b.c", "o");
    obj = getTestObj();
    objectPath.set(obj, ["b","c"], "o");
    expect(obj).to.have.deep.property("b.c", "o");
  });

  it('should set value under array', function() {
    var obj = getTestObj();
    objectPath.set(obj, "b.e.1.g", "f");
    expect(obj).to.have.deep.property("b.e.1.g", "f");
    obj = getTestObj();
    objectPath.set(obj, ["b","e",1,"g"], "f");
    expect(obj).to.have.deep.property("b.e.1.g", "f");
  });

  it('should create intermediate objects', function() {
    var obj = getTestObj();
    objectPath.set(obj, "c.d.e.f", "l");
    expect(obj).to.have.deep.property("c.d.e.f", "l");
    obj = getTestObj();
    objectPath.set(obj, ["c","d","e","f"], "l");
    expect(obj).to.have.deep.property("c.d.e.f", "l");
  });

  it('should create intermediate arrays', function() {
    var obj = getTestObj();
    objectPath.set(obj, "c.0.1.m", "l");
    expect(obj.c[0]).to.be.an("array");
    expect(obj).to.have.deep.property("c.0.1.m", "l");
    obj = getTestObj();
    objectPath.set(obj, ["c","0",1,"m"], "l");
    expect(obj.c[0]).to.be.an("array");
    expect(obj).to.have.deep.property("c.0.1.m", "l");
  });

  it('should set value under integer-like key', function() {
    var obj = getTestObj();
    objectPath.set(obj, "1a", "foo");
    expect(obj).to.have.deep.property("1a", "foo");
    obj = getTestObj();
    objectPath.set(obj, ["1a"], "foo");
    expect(obj).to.have.deep.property("1a", "foo");
  });

  it('should set value under empty array', function() {
    var obj = [];
    objectPath.set(obj, [0], "foo");
    expect(obj[0]).to.be.equal("foo");
    obj = [];
    objectPath.set(obj, "0", "foo");
    expect(obj[0]).to.be.equal("foo");
  });
});


describe('push', function() {
  it('should push value to existing array', function() {
    var obj = getTestObj();
    objectPath.push(obj, "b.c", "l");
    expect(obj).to.have.deep.property("b.c.0", "l");
    obj = getTestObj();
    objectPath.push(obj, ["b","c"], "l");
    expect(obj).to.have.deep.property("b.c.0", "l");
  });

  it('should push value to new array', function() {
    var obj = getTestObj();
    objectPath.push(obj, "b.h", "l");
    expect(obj).to.have.deep.property("b.h.0", "l");
    obj = getTestObj();
    objectPath.push(obj, ["b","h"], "l");
    expect(obj).to.have.deep.property("b.h.0", "l");
  });
});


describe('ensureExists', function() {
  it('should create the path if it does not exists', function() {
    var obj = getTestObj();
    var oldVal = objectPath.ensureExists(obj, "b.g.1.l", "test");
    expect(oldVal).to.not.exist;
    expect(obj).to.have.deep.property("b.g.1.l", "test");
    oldVal = objectPath.ensureExists(obj, "b.g.1.l", "test1");
    expect(oldVal).to.be.equal("test");
    expect(obj).to.have.deep.property("b.g.1.l", "test");
  });


  it('should return the object if path is empty', function() {
    var obj = getTestObj();
    expect(objectPath.ensureExists(obj, [], "test")).to.have.property('a', 'b');
  });
});

describe('coalesce', function(){
  it('should return the first non-undefined value', function(){
    var obj = {
      should: {have: 'prop'}
    };

    expect(objectPath.coalesce(obj, [
      'doesnt.exist',
      ['might','not','exist'],
      'should.have'
    ])).to.equal('prop');
  });

  it('should work with falsy values (null, 0, \'\', false)', function(){
    var obj = {
      is: {
        false: false,
        null: null,
        empty: '',
        zero: 0
      }
    };

    expect(objectPath.coalesce(obj, [
      'doesnt.exist',
      'is.zero'
    ])).to.equal(0);

    expect(objectPath.coalesce(obj, [
      'doesnt.exist',
      'is.false'
    ])).to.equal(false);

    expect(objectPath.coalesce(obj, [
      'doesnt.exist',
      'is.null'
    ])).to.equal(null);

    expect(objectPath.coalesce(obj, [
      'doesnt.exist',
      'is.empty'
    ])).to.equal('');
  });

  it('returns defaultValue if no paths found', function(){
    var obj = {
      doesnt: 'matter'
    };

    expect(objectPath.coalesce(obj, ['some.inexistant','path',['on','object']], 'false')).to.equal('false');
  });
});

describe('del', function(){
  it('should return undefined on empty object', function(){
    expect(objectPath.del({}, 'a')).to.equal(undefined);
  });

  it('should delete deep paths', function(){
    var obj = getTestObj();

    expect(objectPath.del(obj)).to.be.equal(obj);

    objectPath.set(obj, 'b.g.1.0', "test");
    objectPath.set(obj, 'b.g.1.1', "test");
    objectPath.set(obj, 'b.h.az', "test");

    expect(obj).to.have.deep.property("b.g.1.0","test");
    expect(obj).to.have.deep.property("b.g.1.1","test");
    expect(obj).to.have.deep.property("b.h.az","test");

    objectPath.del(obj, 'b.h.az');
    expect(obj).to.not.have.deep.property("b.h.az");
    expect(obj).to.have.deep.property("b.h");

    objectPath.del(obj, 'b.g.1.1');
    expect(obj).to.not.have.deep.property("b.g.1.1");
    expect(obj).to.have.deep.property("b.g.1.0","test");

    objectPath.del(obj, ['b','g','1','0']);
    expect(obj).to.not.have.deep.property("b.g.1.0");
    expect(obj).to.have.deep.property("b.g.1");

    expect(objectPath.del(obj, ['b'])).to.not.have.deep.property("b.g");
    expect(obj).to.be.deep.equal({'a':'b'});
  });

  it('should remove items from existing array', function(){
    var obj = getTestObj();

    objectPath.del(obj, 'b.d.0');
    expect(obj.b.d).to.have.length(1);
    expect(obj.b.d).to.be.deep.equal(['b']);

    objectPath.del(obj, 'b.d.0');
    expect(obj.b.d).to.have.length(0);
    expect(obj.b.d).to.be.deep.equal([]);
  });

  it('should skip undefined paths', function(){
    var obj = getTestObj();

    expect(objectPath.del(obj, 'do.not.exist')).to.be.equal(obj);
    expect(objectPath.del(obj, 'a.c')).to.be.equal('b');
  });
});