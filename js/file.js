"use strict";

function File(id, name, type, content, parentId) {
    this._id = id;
    this._name = name;
    this._type = type;
    this._content = content;
    this._parentId = parentId;
    this._items = [];
}

File.prototype.rename = function (newName) {
    this._name = newName;
};

File.prototype.changeContent = function (newContent) {
    this._content = newContent;
};

File.prototype.changeParentId = function (newParentId) {
    this._parentId = newParentId;
};

File.prototype.addItem = function (itemId){
    this._items.push(itemId);
};

File.prototype.removeItem = function (itemId) {
    let index = this._items.indexOf(itemId);
    if (index > -1){
        this._items.splice(index, 1);
    }
};

File.prototype.isDirectory= function () {
    if (this._type === 'directory'){
      return true;
    }
    return false;
};