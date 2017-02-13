"use strict";

function seperateFilesInsideDirectory(directory, directories, files){
    for (let i = 0; i < directory.items.length; i++){
        if (fileSystem.allFiles[directory.items[i]].isDirectory()){
            directories.push(fileSystem.allFiles[directory.items[i]]);
        } else {
            files.push(fileSystem.allFiles[directory.items[i]]);
        }
    }
}


function mergeSort(array, type){
    if (array.length < 2) {
        return array;
    }

    let middle = Math.floor(array.length / 2);
    let left = array.slice(0, middle);
    let right = array.slice(middle);

    switch(type){
        case 'fileName':
            return mergeName(mergeSort(left, 'fileName'), mergeSort(right, 'fileName'));
            break;

        case 'id':
            return mergeId(mergeSort(left, 'id'), mergeSort(right, 'id'));
            break;
    }
}

function mergeName(left, right) {
    let result = [];
    let indexLeft = 0;
    let indexRight = 0;

    while (indexLeft < left.length && indexRight < right.length) {
        if (left[indexLeft].name.toLowerCase() < right[indexRight].name.toLowerCase()) {
            result.push(left[indexLeft++]);
        } else if (left[indexLeft].name.toLowerCase() === right[indexRight].name.toLowerCase()) {
            if ((left[indexLeft].type < right[indexRight].type)) {
                result.push(left[indexLeft++]);
            } else {
                result.push(right[indexRight++]);
            }
        }else {
            result.push(right[indexRight++]);
        }
    }
    return result.concat(left.slice(indexLeft).concat(right.slice(indexRight)));
}


function mergeId(left, right) {
    let result = [];
    let indexLeft = 0;
    let indexRight = 0;

    while (indexLeft < left.length && indexRight < right.length) {
        if (left[indexLeft].id < right[indexRight].id) {
            result.push(left[indexLeft++]);
        }else {
            result.push(right[indexRight++]);
        }
    }
    return result.concat(left.slice(indexLeft).concat(right.slice(indexRight)));
}
