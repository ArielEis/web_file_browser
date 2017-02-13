"use strict";

function File(id, name, type, content, parentId) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.content = content;
    this.parentId = parentId;
    this.items = [];
}

File.prototype.rename = function (newName) {
    this.name = newName;
};

File.prototype.changeContent = function (newContent) {
    this.content = newContent;
};

File.prototype.changeParentId = function (newParentId) {
    this.parentId = newParentId;
};

File.prototype.addItem = function (itemId){
    this.items.push(itemId);
};

File.prototype.removeItem = function (itemId) {
    let index = this.items.indexOf(itemId);
    if (index > -1){
        this.items.splice(index, 1);
    }
};

File.prototype.isDirectory= function () {
    if (this.type === 'directory'){
      return true;
    }
    return false;
};