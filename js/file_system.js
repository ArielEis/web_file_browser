"use strict";

function FileSystem(name){
    this.root = new File(0, name, 'directory', '', -1);
    this.nextFileId = 1;
    this.filesIndex = [0];
    this.allFiles = [this.root];
}

FileSystem.prototype.getRoot = function () {
  return this.root;
};


FileSystem.prototype.addDirectoryToDirectory = function(parentId, directoryName){
    let parent = this.allFiles[parentId];
    let newDirectory = new File(this.nextFileId, directoryName, 'directory', '', parentId);
    parent.addItem(this.nextFileId);
    this.filesIndex.push(this.nextFileId);
    this.allFiles.push(newDirectory);
    this.nextFileId++;
};

FileSystem.prototype.addFileToDirectory = function(parentId, fileName, type, content){
    let parent = this.allFiles[parentId];
    let newFile = new File(this.nextFileId, fileName, type, content, parentId);
    parent.addItem(this.nextFileId);
    this.filesIndex.push(this.nextFileId);
    this.allFiles.push(newFile);
    this.nextFileId++;
};


FileSystem.prototype.getFileById = function (fileId) {
    return this.allFiles[fileId];
};

FileSystem.prototype.changeIsClose = function(fileId){
    let file = this.allFiles[fileId];
    for (let i = 0; i < file.items.length; i++){
        this.changeIsClose(file.items[i]);
    }
    file.changeItToClose();
};

FileSystem.prototype.isDirectoryNameExist = function(directory, name){
    for (let i = 0; i < directory.items.length; i++){
        if (this.allFiles[directory.items[i]].name === name &&
                this.allFiles[directory.items[i]].type === 'directory'){
            return true;
        }
    }
    return false;
};

FileSystem.prototype.isFileNameExist = function(directory, name, type){
    for (let i = 0; i < directory.items.length; i++){
        if (this.allFiles[directory.items[i]].name === name &&
                this.allFiles[directory.items[i]].type === type){
            return true;
        }
    }
    return false;
};

FileSystem.prototype.deleteItem = function (index) {
    let currentItem = this.allFiles[index];
    while(currentItem.items.length > 0){
        this.deleteItem(currentItem.items.pop());
    }
    this.allFiles[index] = undefined;
    this.filesIndex[index] = undefined;
};

FileSystem.prototype.getParentById = function (id){
    return this.allFiles[this.allFiles[id].parentId];
};

FileSystem.prototype.getFreeNewName = function (id, name ,type) {
    let currentItem = this.allFiles[id];
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
    let currentFile = this.allFiles[id];
    let path = [];
    path.push(currentFile.name);
    while(currentFile.id > 0){
        currentFile = this.allFiles[currentFile.parentId];
        path.push(currentFile.name);
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
    if (this.getRoot().name.toLowerCase() === path[0].toLowerCase()){
        let currentNode = this.getRoot();
        let index = 1;
        let isFound = true;
        let isRunning = true;
        let counter = 0;
        while (isRunning && index < path.length){
            isFound = false;
            while(counter < currentNode.items.length && !isFound){
                if (this.allFiles[currentNode.items[counter]].name.toLowerCase()
                        === path[index].toLowerCase()){
                    isFound = true;
                    currentNode = this.allFiles[currentNode.items[counter]];
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
    for (let i = 0; i < this.allFiles.length; i++){
        let file = this.allFiles[i];
        if (file !== undefined){
            linearArray.push({
                id: file.id,
                name: file.name,
                type: file.type,
                content: file.content,
                parentId:  file.parentId,
            });
        }
    }
    localStorage.setItem('file_system', JSON.stringify(linearArray));
};


FileSystem.prototype.buildIt = function () {
    let linearArray = localStorage.getItem('file_system');
    linearArray = JSON.parse(linearArray);
    this.getRoot().rename(linearArray[0].name);
    if (linearArray.length > 0){
        let parent = null;
        for (let i = 1; i < linearArray.length; i++){
            parent = this.allFiles[linearArray[i].parentId];
            if (linearArray[i].type === 'directory'){
                this.addDirectoryToDirectory(parent.id, linearArray[i].name);
            } else {
                this.addFileToDirectory(parent.id, linearArray[i].name, linearArray[i].type,
                        linearArray[i].content);
            }
        }
    }
};