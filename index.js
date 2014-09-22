/**
 * Helper for remove items from an array
 * @param value
 * @returns {*}
 */

Array.prototype.remove = function (value) {
  var idx = this.indexOf(value);
  if (idx != -1) {
    return this.splice(idx, 1); // The second parameter is the number of elements to remove.
  }
  return false;
};

/**
 *
 * @param id
 * @param age
 * @param parent
 * @constructor
 */

var Mobster = function (id, age, parent) {
  this.subordinates = [];
  this.age = age;
  this.parent = parent;
  this.id = id;
};

/**
 * Find eldest of my subordinates
 */

Mobster.prototype.findEldest = function(){
  var eldest = this;
  for (var i = 0;i<this.subordinates.length;i++) {
    var t = this.subordinates[i].findEldest();
    if (t.age > eldest.age) {
      eldest = t;
    }
  }
};

/**
 * Clone mobster for further operations
 * @returns {Mobster}
 */

Mobster.prototype.clone = function(){
  var cloned = new Mobster(this.id, this.age, this.parent);
  for (var i = 0;i<this.subordinates.length;i++) {
    var n = this.subordinates[i].clone();
    n.parent = cloned;
    cloned.subordinates.push(n);
  }
  return cloned;
};

/**
 * Get level of the mobster
 * @param i
 * @param undefined
 * @returns {*}
 */

Mobster.prototype.getLevel = function (i, undefined) {
  if (i === undefined) {
    //First time we don't recieve i
    i = 0;
  }
  if (this.parent==null) {
    return i;
  } else {
    return this.parent.getLevel(++i);
  }
};

/**
 * Add subordinate to the mobster
 * @param mobster
 */

Mobster.prototype.addMember = function (mobster) {
  this.subordinates.push(mobster);
  mobster.parent = this;
};

/**
 * Helper to iterate subordinates
 * @param f
 */

Mobster.prototype.forEachSubordinate = function (f) {
  for(var i = 0;i<this.subordinates.length;i++)
    f.call(this.subordinates[i], i, this.subordinates[i]);
};

/**
 * Find mobster by id
 * @param id
 * @returns {*}
 */

Mobster.prototype.findById = function (id) {
  var result;
  if(this.id == id)
    return this;
  else {
    this.forEachSubordinate(function(i, element) {
      var t = this.findById(id);
      if(t!=null)
        result = t;
    });
  }
  return result;
};

/**
 * Find mobster's subordinates or deeper level subordinates
 * @param level
 * @returns {Array}
 */

Mobster.prototype.findChildrenByLevel = function (level) {
  var result = [];
  if(level == 1) {
    result = result.concat(this.subordinates);
  } else {
    for(var i = 0;i<this.subordinates.length;i++) {
      result = result.concat(this.subordinates[i].findChildrenByLevel(level-1));
    }
  }
  return result;
};

/**
 * Find total number of subordinates
 * @returns {number}
 */

Mobster.prototype.countSubordinates = function () {
  var subordinates = 0;
  this.forEachSubordinate( function(i, element) {
    if (element.subordinates.length != 0) {
      element.countSubordinates();
      subordinates++;
    }
    subordinates++;
  });
  return subordinates;
};


var Mafia = function (rootId, rootAge) {
  var root = new Mobster(rootId, rootAge, null);

  /**
   * Find eldest member for organization
   * @param mobsters
   * @returns {*}
   */

  var findEldest = function(mobsters){
    var eldest = mobsters.length>0?mobsters[0]:null;
    for (var i = 1;i<mobsters.length;i++) {
      if (eldest.age<mobsters[i].age) {
        eldest = mobsters[i];
      }
    }
    return eldest;
  };

  return {
    root: root,
    jail:[],

    /**
     * Method to put a mobster under surveillance if he has 50 or more subordinates
     * @param mobster
     * @returns {boolean}
     */

    mobsterForSurveillance: function (mobster) {
      var _SUBORDINATES = 50;
      return (mobster.countSubordinates() >= _SUBORDINATES);
    },

    /**
     * Find mobster with higher rank between two of them
     * @param mobster1
     * @param mobster2
     * @returns {string|*}
     */

    highestRanked: function (mobster1, mobster2) {
      return (mobster1.getLevel() < mobster2.getLevel()) ? mobster1.id : mobster2.id;
    },

    /**
     * Release member from prison.
     * @param cloned
     */

    backFromJail: function (cloned) {
      //cloned refers to mobster right before we put him out from the tree
      cloned.forEachSubordinate( function() {
        var t = root.findById(this.id);
        t.parent.subordinates.remove(t);
        t.parent = null;
      });

      cloned.parent.addMember(cloned);
    },

    /**
     * Put member in jail
     * @param mobster
     */

    putInJail: function(mobster) {
      //Find mobster level
      var mobsterLevel = mobster.getLevel();

      //Clone him
      var cloned = mobster.clone();

      //We store him in jail
      this.jail.push(cloned);

      //Store former boss
      var oldParent = mobster.parent;

      //Remove his subordinates
      oldParent.subordinates.remove(mobster);

      //He has no parent anymore
      mobster.parent = null;

      //At this point we cloned the imprisoned member and stored him in our JAIL array. The original mobster is removed from the organization and we relocate his subordinates
      //Knowing the mobster's level we try to find other mobsters at the same level. Otherwise we promote the eldest subordinate of the given mobster
      var sameLevel = root.findChildrenByLevel(mobsterLevel);

      if(sameLevel.length>0){
        var newBoss = findEldest(sameLevel);
        for (var i = 0;i<mobster.subordinates.length;i++) {
          mobster.subordinates[i].parent = newBoss;
          newBoss.subordinates.push(mobster.subordinates[i]);
        }
      }else{
        var newBoss = findEldest(mobster.subordinates);
        oldParent.subordinates.push(newBoss);
        newBoss.parent = oldParent;
        mobster.subordinates.remove(newBoss);

        for (var i = 0;i<mobster.subordinates.length;i++) {
          mobster.subordinates[i].parent = newBoss;
          newBoss.subordinates.push(mobster.subordinates[i]);
        }
      }
    }
  }
};

