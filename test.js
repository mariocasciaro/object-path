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
    expect(objectPath.get(getTestObj(), "a")).to.be.equal("b");
  });

  it('should return the value under deep object', function() {
    expect(objectPath.get(getTestObj(), "b.f")).to.be.equal("i");
  });

  it('should return the value under array', function() {
    expect(objectPath.get(getTestObj(), "b.d.0")).to.be.equal("a");
  });

  it('should return the value under array deep', function() {
    expect(objectPath.get(getTestObj(), "b.e.1.f")).to.be.equal("g");
  });

  it('should return undefined for missing values under object', function() {
    expect(objectPath.get(getTestObj(), "a.b")).to.not.exist;
  });

  it('should return undefined for missing values under array', function() {
    expect(objectPath.get(getTestObj(), "b.d.5")).to.not.exist;
  });

  it('should return the value under integer-like key', function() {
    expect(objectPath.get({ "1a": "foo" }, "1a")).to.be.equal("foo");
  });
});


describe('set', function() {
  it('should set value under shallow object', function() {
    var obj = getTestObj();
    objectPath.set(obj, "c", {m: "o"});
    expect(obj).to.have.deep.property("c.m", "o");
  });

  it('should set value under deep object', function() {
    var obj = getTestObj();
    objectPath.set(obj, "b.c", "o");
    expect(obj).to.have.deep.property("b.c", "o");
  });

  it('should set value under array', function() {
    var obj = getTestObj();
    objectPath.set(obj, "b.e.1.g", "f");
    expect(obj).to.have.deep.property("b.e.1.g", "f");
  });

  it('should create intermediate objects', function() {
    var obj = getTestObj();
    objectPath.set(obj, "c.d.e.f", "l");
    expect(obj).to.have.deep.property("c.d.e.f", "l");
  });

  it('should create intermediate arrays', function() {
    var obj = getTestObj();
    objectPath.set(obj, "c.0.1.m", "l");
    expect(obj.c[0]).to.be.an("array");
    expect(obj).to.have.deep.property("c.0.1.m", "l");
  });

  it('should set value under integer-like key', function() {
    var obj = getTestObj();
    objectPath.set(obj, "1a", "foo");
    expect(obj).to.have.deep.property("1a", "foo");
  });

  it('should set value under empty array', function() {
    var obj = [];
    objectPath.set(obj, [0], "foo");
    expect(obj[0]).to.be.equal("foo");
  });
});


describe('push', function() {
  it('should push value to existing array', function() {
    var obj = getTestObj();
    objectPath.push(obj, "b.c", "l");
    expect(obj).to.have.deep.property("b.c.0", "l");
  });

  it('should push value to new array', function() {
    var obj = getTestObj();
    objectPath.push(obj, "b.h", "l");
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
