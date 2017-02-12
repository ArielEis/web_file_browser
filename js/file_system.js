"use strict";

function FileSystem(name){
    this._root = new File(0, name, 'directory', '', -1);
    this._nextFileId = 1;
    this._filesIndex = [0];
    this._allFiles = [this._root];
}

FileSystem.prototype.getRoot = function () {
  return this._root;
};


FileSystem.prototype.addDirectoryToDirectory = function(parentId, directoryName){
    let parent = this._allFiles[parentId];
    let newDirectory = new File(this._nextFileId, directoryName, 'directory', '', parentId);
    parent.addItem(this._nextFileId);
    this._filesIndex.push(this._nextFileId);
    this._allFiles.push(newDirectory);
    this._nextFileId++;
};

FileSystem.prototype.addFileToDirectory = function(parentId, fileName, type, content){
    let parent = this._allFiles[parentId];
    let newFile = new File(this._nextFileId, fileName, type, content, parentId);
    parent.addItem(this._nextFileId);
    this._filesIndex.push(this._nextFileId);
    this._allFiles.push(newFile);
    this._nextFileId++;
};


FileSystem.prototype.getFileById = function (fileId) {
    return this._allFiles[fileId];
};

FileSystem.prototype.changeIsClose = function(fileId){
    let file = this._allFiles[fileId];
    for (let i=0; i<file._items.length; i++){
        this.changeIsClose(file._items[i]);
    }
    file.changeItToClose();
};

FileSystem.prototype.isDirectoryNameExist = function(directory, name){
    for (let i=0; i<directory._items.length; i++){
        if (this._allFiles[directory._items[i]]._name === name &&
                this._allFiles[directory._items[i]]._type === 'directory'){
            return true;
        }
    }
    return false;
};

FileSystem.prototype.isFileNameExist = function(directory, name, type){
    for (let i=0; i<directory._items.length; i++){
        if (this._allFiles[directory._items[i]]._name === name &&
                this._allFiles[directory._items[i]]._type === type){
            return true;
        }
    }
    return false;
};

FileSystem.prototype.deleteItem = function (index) {
    let currentItem = this._allFiles[index];
    while(currentItem._items.length > 0){
        this.deleteItem(currentItem._items.pop());
    }
    this._allFiles[index] = undefined;
    this._filesIndex[index] = undefined;
};

FileSystem.prototype.getParentById = function (id){
    return this._allFiles[this._allFiles[id]._parentId];
};

FileSystem.prototype.getFreeNewName = function (id, name ,type) {
    let currentItem = this._allFiles[id];
    let count = 0;
    let isFound = false;
    let newName = name;
    if (this.isFileNameExist(currentItem, newName, type)){
      while (!isFound){
        count++;
          if (!this.isFileNameExist(currentItem, name+' ('+count+')', type)) {
              return name+' (' + count + ')';
          }
      }
    }
    return newName;
};

FileSystem.prototype.getPathOfFileById = function (id) {
    let currentFile = this._allFiles[id];
    let path = [];
    path.push(currentFile._name);
    while(currentFile._id > 0){
        currentFile = this._allFiles[currentFile._parentId];
        path.push(currentFile._name);
    }
    let pathString = path.pop();
    while(path.length > 0){
        pathString += '/'+path.pop();
    }
    return pathString;
};



FileSystem.prototype.getFileByPath = function (pathString) {
    let file = undefined;
    let path = pathString.split('/');
    if (this.getRoot()._name.toLowerCase() === path[0].toLowerCase()){
        let currentNode = this.getRoot();
        let index = 1;
        let isFound = true;
        let isRunning = true;
        let counter = 0;
        while (isRunning && index < path.length){
            isFound = false;
            while(counter < currentNode._items.length && !isFound){
                if (this._allFiles[currentNode._items[counter]]._name.toLowerCase()
                        === path[index].toLowerCase()){
                    isFound = true;
                    currentNode = this._allFiles[currentNode._items[counter]];
                    index++;
                }
                counter++;
            }
            if (!isFound){
                isRunning = false;
            }
        }
        if (isFound){
            file = currentNode;
        }
    }
    return file;
};


FileSystem.prototype.saveInLocalStorage = function () {
    let linearArray = [];
    for (let i=0; i<this._allFiles.length; i++){
        let file = this._allFiles[i];
        if (file !== undefined){
            linearArray.push({
                _id: file._id,
                _name: file._name,
                _type: file._type,
                _content: file._content,
                _parentId:  file._parentId,
            });
        }
    }
    localStorage.setItem('file_system', JSON.stringify(linearArray));
};


FileSystem.prototype.buildIt = function () {
    let linearArray = localStorage.getItem('file_system');
    linearArray = JSON.parse(linearArray);
    this.getRoot().rename(linearArray[0]._name);
    if (linearArray.length > 0){
        let parent = null;
        for (let i=1; i<linearArray.length; i++){
            parent = this._allFiles[linearArray[i]._parentId];
            if (linearArray[i]._type === 'directory'){
                this.addDirectoryToDirectory(parent._id, linearArray[i]._name);
            } else {
                this.addFileToDirectory(parent._id, linearArray[i]._name, linearArray[i]._type,
                        linearArray[i]._content);
            }
        }
    }
};