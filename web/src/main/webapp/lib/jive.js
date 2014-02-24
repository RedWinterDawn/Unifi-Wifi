'use strict';

var jive = {};

/*
 * Recursively merge properties of two objects
 */
jive.mergeRecursive = function (obj1, obj2) {
    for (var p in obj2) {
        try {
            // Property in destination object set; update its value.
            if ( obj2[p].constructor==Object )
                obj1[p] = jive.mergeRecursive(obj1[p], obj2[p]);
            else
                obj1[p] = obj2[p];
        } catch(e) {
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];
        }
    }
    return obj1;
}

jive.applyProps = function(source, dest, props){
    props.forEach(function(prop){
        dest[prop] = source[prop];
    })
};

Array.prototype.distinct = function() {
    return this.filter(function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    });
};

Array.prototype.pluck = function(property) {
    return this.map(function(obj){
        return obj[property];
    })
};

