"use strict";

/* Start of local variables */
var page = $('#page');
var content = $('#content');
var browser = $('#browser');
var contentMenu =  $('#content_menu');
var promptTemplate = $('#template_prompt');
var alertTemplate = $('#template_alert');
var openFileWindow = $('#open_file_window');
var address = $('#address_line');
var backwardButton = $('#go_back');
var forwardButton = $('#go_forward');
var newFileMenu = contentMenu.find('#new_file_menu');
var contentMenuTitle = contentMenu.find('#menu_title');
var contentTemplate = content.find('.template');
var browserTemplate = browser.find('.template li');
var fileSystem;
var currentLocationId = -1;
var targetId = -1;
var historyLog = [-1];
var historyPointer = 0;
var historyLogMaxSize = 50;
/* end of local variables */


$(document).ready(function () {
    createSystem();
    initialContextMenuOptions();
    initializeTopBar();
    initializeBrowser();
    initializeContent();
});




/* Start of - Initialize functions */

function createSystem() {
    let system = localStorage.getItem('file_system');
    fileSystem = new FileSystem('Root');
    if (system !== null){
        fileSystem.buildIt();
    }
}


function initializeTopBar() {
    address.val('');
    backwardButton.attr('disabled', true);
    forwardButton.attr('disabled', true);
    address.on('keyup', function (e) {
        if (e.keyCode == 13) {
            let directory = fileSystem.getFileByPath(address.val());
            if (directory !== undefined) {
                openDirectory(directory, false);
            } else {
                createAlertMessage('address location isn\'t exist');
                updateAddressLine();
            }
        }
    });
    initialNavigateButtons();
}


function initialNavigateButtons(){
    initializeBackwardButton();
    initializeForwardButton();
}


function initializeBackwardButton(){
    backwardButton.click(function () {
        if (historyPointer > 0){
            let backToDirectory = undefined;
            while (backToDirectory === undefined && historyPointer > 0){
                historyPointer--;
                backToDirectory = fileSystem.getFileById(historyLog[historyPointer]);
            }
            if (historyPointer === 0){
                handleNavigationButtonsEnable();
                closeDirectory(fileSystem.getFileById(historyLog[1]));
            } else {
                handleNavigationButtonsEnable();
                openDirectory(backToDirectory, true);
            }
        }
    });
}

function initializeForwardButton() {
    forwardButton.click(function () {
        if (historyPointer < historyLogMaxSize && historyPointer < (historyLog.length-1)) {
            let goToDirectory = undefined;
            historyPointer++;
            while (goToDirectory === undefined && historyPointer > 0){
                goToDirectory = fileSystem.getFileById(historyLog[historyPointer]);
                if (goToDirectory === undefined){
                    historyLog.splice(historyPointer,1);
                }
            }
            handleNavigationButtonsEnable();
            openDirectory(goToDirectory, true);
        }
    });
}

function initializeBrowser(){
    browser.empty();
    let newNode = browserTemplate.clone();
    newNode.find('.arrow').remove();
    let folder = newNode.find('.folder');
    folder.attr('id', 'folder_0');
    folder.attr('index', 0);
    addListenerClickToFolderIconOnBrowser(folder);
    let aTag = newNode.find('a');
    aTag.text(fileSystem.getRoot().name);
    aTag.attr('class', 'a_ul');
    aTag.attr('index', 0);
    aTag.attr('state', 'close');
    addListenerClickToATagForOpenOrCloseDirectoryInBrowser(aTag);
    browser.append(newNode);
    browser.contextmenu(function () {
        return false;
    });

    browser.mousedown(function (event) {
       if (event.button !== 2){
           closeObject([contentMenu, newFileMenu], 200);
       }
    });
}

function initializeContent() {
    content.empty();
    content.css({'background-color':'#666'});
    content.contextmenu(function () {
        return false;
    });

    content.mousedown(function (event) {
        if (currentLocationId > -1){
            setRightClickContextMenu(event);
        }
    });
}



function initialContextMenuOptions(){
    addListenerClickToDeleteFile();
    addListenerClickToRenameFile();
    addListenerClickToNewFile();
    addListenerClickToQuitContentMenu();
    addListenerClickToCreateNewDirectory();
    addListenerClickToCreateNewFile();
}


/* End of - Initialize functions */


/* Function for browser window */


function openDirectoryOnBrowser(directory){
    browser.find('#folder_'+directory.id).attr('src', 'pics/open_directory.png');
    let allDirectories = [];
    let allFiles = [];
    seperateFilesInsideDirectory(directory, allDirectories, allFiles);
    allDirectories = mergeSort(allDirectories, 'fileName');
    for (let i = 0; i < allDirectories.length; i++){
        drawDirectoryOnBrowser(allDirectories[i].name, allDirectories[i].id, directory.id);
    }
}


function closeDirectoryOnBrowser(directory){
    browser.find('#folder_'+directory.id).attr('src', 'pics/close_directory.png');
    for (let i = 0; i < directory.items.length; i++){
        removeDirectoryFromBrowser(directory.items[i].id);
    }
}


function removeDirectoryFromBrowser() {
    browser.find('#ul_' + targetId).remove();
}


function drawDirectoryOnBrowser(name, id, parentId){
    let newNode = browserTemplate.clone();
    let folder = newNode.find('.folder');
    folder.attr('id', 'folder_'+id);
    folder.attr('index', id);
    addListenerClickToFolderIconOnBrowser(folder);
    let aTag = newNode.find('a');
    aTag.text(name);
    newNode.find('ul').attr('id', 'ul_'+id);
    aTag.attr('id', 'a_' + id);
    aTag.attr('index', id);
    aTag.attr('state', 'close');
    addListenerClickToATagForOpenOrCloseDirectoryInBrowser(aTag);
    browser.find('#ul_' + parentId).append(newNode);
}


/* Function for content window */


function openDirectory(directory, isHistoryRequest){
    content.css({'background-color':'snow'});
    content.empty();
    currentLocationId = directory.id;
    let allDirectories = [];
    let allFiles = [];
    seperateFilesInsideDirectory(directory, allDirectories, allFiles);
    allDirectories = mergeSort(allDirectories, 'fileName');
    allFiles = mergeSort(allFiles, 'fileName');
    for (let i = 0; i < allDirectories.length; i++){
        drawDirectoryOnContent(allDirectories[i].name, allDirectories[i].id);
    }
    for (let i = 0; i < allFiles.length; i++) {
        drawFileOnContent(allFiles[i].name, allFiles[i].id, allFiles[i].type);
    }
        updateAddressLine();
    if (!isHistoryRequest){
        historyLog.length = historyPointer+1;
        addDirectoryIntoHistoryLog(directory);
    }
}


function closeDirectory(directory){
    currentLocationId = directory.parentId;
    content.empty();
    content.css({'background-color':'#666'});
    address.val('');
}



function showFileContent() {
    let window = openFileWindow.clone();
    let file = fileSystem.getFileById(targetId);
    window.find('.file_title').text(file.name+".txt");
    let input = window.find('#file_content_text');
    input.text(file.content);
    window.find('#file_quit').click(function () {
        closeObject([window], 200);
    });
    window.find('#cancel_file').click(function () {
        closeObject([window], 200);
    });
    window.find('#save_file').click(function () {
        file.changeContent(input.val());
        saveSystem();
        closeObject([window], 200);
    });
    page.append(window);
    openObject([window], 200);
}


function drawDirectoryOnContent(name, id){
    let newFolder = contentTemplate.clone();
    let folderIcon = newFolder.find(".icon");
    setUpFileContent(newFolder, folderIcon, name, id ,'directory');
    folderIcon.dblclick(function () {
        targetId = parseInt($(this).attr('index'));
        let targetDirectory = fileSystem.getFileById(id);
        openDirectory(targetDirectory, false);
    });
    content.append(newFolder);
}

function drawFileOnContent(name, id, type){
    let newFile = contentTemplate.clone();
    let folderIcon = newFile.find(".icon");
    setUpFileContent(newFile, folderIcon, name, id ,type);
    folderIcon.dblclick(function () {
        targetId = parseInt($(this).attr('index'));
        showFileContent();
    });
    content.append(newFile);
}


function removeItemFromContent() {
    content.find('#file_'+targetId).remove();
}


function setUpFileContent(file, icon, name, id, type){
    file.attr('id', 'file_'+id);
    file.find(".file_name").text(name);
    icon.attr('index', id);
    switch(type){
        case 'txt':
            icon.attr('src', 'pics/txt.png');
            icon.css({'width':'60%'});
            break;
    }
    icon.mousedown(function (event) {
        if (event.button === 2){
            targetId = parseInt($(this).attr('index'));
        }
    });
}


/* Function for top bar */

function updateAddressLine(){
    if (currentLocationId >= 0){
        address.val(fileSystem.getPathOfFileById(currentLocationId));
    } else {
        address.val('');
    }
}


function handleNavigationButtonsEnable(){
    if (historyPointer <= 0){
        disableButton(backwardButton);
    } else {
        enableButton(backwardButton);
    }

    if (historyPointer > -1 && historyPointer < historyLog.length-1){
        enableButton(forwardButton);
    } else {
        disableButton(forwardButton);
    }

}

function disableButton(button){
    button.attr('disabled', true);
    button.attr('class', 'disabled_button');
}

function enableButton(button){
    button.attr('disabled', false);
    button.attr('class', 'enabled_button');
}



function addDirectoryIntoHistoryLog(node){
    if (historyLog[historyPointer] !== node.id){
        if (historyPointer < (historyLog.length-1)){
            historyLog.splice(historyPointer+1);
        }

        if (historyLog.length > historyLogMaxSize) {
            historyLog.shift();
            historyPointer = historyLogMaxSize-1;
        }
        historyLog.push(node.id);
        historyPointer++;
    }
    handleNavigationButtonsEnable();
}


/* Function influence on file system */


function createNewDirectory(name){
    checkTargetFromBrowserOrFromContent();
    fileSystem.addDirectoryToDirectory(targetId, name);
    if (browser.find('#folder_'+targetId).attr('src') === 'pics/open_directory.png'){
        drawDirectoryOnBrowser(name, (fileSystem.nextFileId-1), targetId);
    } else {
        openDirectoryOnBrowser(fileSystem.getFileById(targetId));
    }
    if (targetId === currentLocationId){
        drawDirectoryOnContent(name, (fileSystem.nextFileId-1));
    }
    saveSystem();
}

function createNewFile(name, type){
    checkTargetFromBrowserOrFromContent();
    fileSystem.addFileToDirectory(targetId, name, type, 'Empty-file');
    if (targetId === currentLocationId){
        drawFileOnContent(name, (fileSystem.nextFileId-1), type);
    }
    saveSystem();
}


function deleteItem(){
    checkTargetFromBrowserOrFromContent();
    setConfirmDeletePrompt();
}

function deleteItemExecute() {
    let parent = fileSystem.getParentById(targetId);
    parent.removeItem(targetId);
    if (fileSystem.getFileById(targetId).isDirectory()){
        removeDirectoryFromBrowser();
    }
    if (targetId === currentLocationId){
        removeItemFromContent();
    }
    fileSystem.deleteItem(targetId);

    content.find('#file_'+targetId).remove();

    if (fileSystem.allFiles[currentLocationId] === undefined){
        currentLocationId = parent.id;
        content.empty();
        openDirectory(parent, false);
    }
    saveSystem();
}


function renameItem(targetFile, name){
    targetFile.rename(name);
    browser.find('#a_'+targetFile.id).text(name);
    content.find('#file_'+targetFile.id).find(".file_name").text(name);
    updateAddressLine();
    saveSystem();
}



/* Context menu */

function setRightClickContextMenu(event){
    if (event.button === 2){
        checkTargetFromBrowserOrFromContent();
        let title = setMaxLengthOfTitle15Characters(fileSystem.getFileById(targetId).name);
        contentMenuTitle.text(title);
        contentMenu.css('left', event.pageX+5);
        contentMenu.css('top', event.pageY+5);
        openObject([contentMenu], 200);
    } else {
        closeObject([contentMenu, newFileMenu], 200);
        targetId = -1;
    }
}


/*  Listeners:    */

function addListenerClickToATagForOpenOrCloseDirectoryInBrowser(aTag) {
    aTag.click(function () {
        let index = parseInt($(this).attr('index'));
        let directory = fileSystem.getFileById(index);
        if ($(this).attr('state') === 'open'){
            $(this).attr('state', 'close');
            closeDirectory(directory);
        } else {
            $(this).attr('state', 'open');
            openDirectory(directory, false);
        }
    });

    aTag.mousedown(function (event) {
        targetId = parseInt($(this).attr('index'));
        setRightClickContextMenu(event)
    });
}


function addListenerClickToDeleteFile() {
    let deleteFile = contentMenu.find('#delete_file');
    deleteFile.click(function () {
        closeObject([contentMenu], 200);
        deleteItem();
    });
    deleteFile.hover(function () {
        closeObject([newFileMenu], 200);
    });
}


function addListenerClickToRenameFile() {
    let renameFile = contentMenu.find('#rename_file');
    renameFile.click(function () {
        closeObject([contentMenu], 200);
        setRenamePrompt();
    });
    renameFile.hover(function () {
        closeObject([newFileMenu], 200);
    });
}

function addListenerClickToNewFile() {
    contentMenu.find('#new_file').hover(function (event) {
        if (newFileMenu.css('display') === 'none'){
            newFileMenu.css('left', event.pageX +40);
            newFileMenu.css('top', event.pageY -15);
            openObject([newFileMenu], 200);
        }
    });
}

function addListenerClickToCreateNewDirectory(){
    newFileMenu.find('#new_directory').click(function () {
        closeObject([newFileMenu, contentMenu], 200);
        createPromptNewDirectory();
    });
}

function addListenerClickToCreateNewFile(){
    newFileMenu.find('#new_txt_file').click(function () {
        closeObject([newFileMenu, contentMenu], 200);
        createPromptNewTextFile();
    });
}

function addListenerClickToQuitContentMenu(){
    let quitMenu = contentMenu.find('.quit_menu');
    quitMenu.click(function () {
        closeObject([newFileMenu, contentMenu], 200);
        targetId = -1;
    });

    quitMenu.hover(function () {
        closeObject([newFileMenu], 200);
    });
}


function addListenerClickToFolderIconOnBrowser(icon) {
    icon.click(function () {
        let currentDirectory = fileSystem.getFileById(parseInt($(this).attr('index')));
        if ($(this).attr('src') === 'pics/close_directory.png'){
            openDirectoryOnBrowser(currentDirectory);
        } else {
            closeDirectoryOnBrowser(currentDirectory);
        }
    });
}



/* Validations   */

function validateName(name, message, type, isTargetNeededToBeCheck){
    checkTargetFromBrowserOrFromContent();

    if (name === ''){
        message.push('Name must to contain characters');
        return false;
    }
    if (name.includes('.')){
        message.push('Name cannot contain special characters');
        return false;
    }
    let currentDirectory = fileSystem.getFileById(targetId);
    switch(type){
        case 'directory':
            if (fileSystem.isDirectoryNameExist(currentDirectory, name)){
                message.push('Name is already exist');
                return false;
            }
            break;

        case 'txt':
            if (fileSystem.isFileNameExist(currentDirectory, name, type)){
                message.push('Name is already exist');
                return false;
            }
            break;
    }

    if (isTargetNeededToBeCheck && targetId < 0){
        message.push('Root directory cannot be changed');
        return false;
    }


    return true;
}


function validateDelete(message){
    if (targetId <= 0){
        message.push('This item cannot be deleted!');
        return false;
    }
    return true;
}


/* Prompts:  */

function createPromptNewDirectory(){
    let newPrompt = promptTemplate.clone();
    let confirm = newPrompt.find('.prompt_confirm');
    let input = newPrompt.find('.prompt_text');
    checkTargetFromBrowserOrFromContent();
    setUpNewPrompt(newPrompt, 'New directory name:',
        fileSystem.getFreeNewName(targetId, 'new folder', 'directory'), 'Create', input, confirm);
    confirm.click(function () {
        let message = [];
        if (validateName(input.val(),message, 'directory')){
            closeObject([newPrompt], 1);
            createNewDirectory(input.val());
        } else {
            createAlertMessage(message.pop());
        }
    });
}

function createPromptNewTextFile(){
    let newPrompt = promptTemplate.clone();
    let confirm = newPrompt.find('.prompt_confirm');
    let input = newPrompt.find('.prompt_text');
    checkTargetFromBrowserOrFromContent();
    setUpNewPrompt(newPrompt, 'New txt file name:',
        fileSystem.getFreeNewName(targetId, 'new file', 'txt'), 'Create', input, confirm);
    confirm.click(function () {
        let message = [];
        if (validateName(input.val(),message, 'txt')){
            closeObject([newPrompt], 1);
            createNewFile(input.val(), 'txt');
        } else {
            createAlertMessage(message.pop());
        }
    });
}


function setConfirmDeletePrompt() {
    let newPrompt = promptTemplate.clone();
    let confirm = newPrompt.find('.prompt_confirm');
    let input = newPrompt.find('.prompt_text');
    setUpNewPrompt(newPrompt, 'Delete:', '',
        'Confirm', input, confirm);
    input.remove();
    newPrompt.find('.prompt_content').text('Are you sure?');
    confirm.click(function () {
        let message = [];
        if (validateDelete(message)){
            closeObject([newPrompt], 1);
            deleteItemExecute();
        } else {
            closeObject([newPrompt], 1);
            createAlertMessage(message.pop());
        }
    });
}


function setRenamePrompt() {
    let newPrompt = promptTemplate.clone();
    let confirm = newPrompt.find('.prompt_confirm');
    let input = newPrompt.find('.prompt_text');
    checkTargetFromBrowserOrFromContent();
    let targetFile = fileSystem.getFileById(targetId);
    setUpNewPrompt(newPrompt, 'Rename file:', targetFile.name,
        'Rename', input, confirm);
    confirm.click(function () {
        let message = [];
        targetId = targetFile.parentId;
        if (validateName(input.val(),message, targetFile.type, true)){
            targetId = targetFile.id;
            closeObject([newPrompt], 1);
            renameItem(targetFile, input.val());
        } else {
            createAlertMessage(message.pop());
        }
    });
}





function setUpNewPrompt(prompt, title, text, confirm_text, input, confirm){
    prompt.find('.prompt_title').text(title);
    input.val(text);
    confirm.attr('value', confirm_text);

    prompt.find('.prompt_quit').click(function () {
        closeObject([prompt], 200);
        prompt.remove();
    });
    prompt.find('.prompt_cancel').click(function () {
        closeObject([prompt], 200);
        prompt.remove();
    });
    page.append(prompt);
    openObject([prompt], 200);
}


/* Alert:  */

function createAlertMessage(message){
    let newAlert = alertTemplate.clone();
    newAlert.find('.alert_text').text(message);
    newAlert.find('.alert_confirm').click(function () {
        closeObject([newAlert], 200);
        newAlert.remove();
    });
    content.append(newAlert);
    openObject([newAlert], 200);
}


/* General functions */

function closeObject(objects, timer){
    for(let i=0; i<objects.length; i++){
        objects[i].fadeOut(timer);
    }
}

function openObject(objects, timer){
    for(let i=0; i<objects.length; i++){
        objects[i].fadeIn(timer);
    }
}



function checkTargetFromBrowserOrFromContent(){
    if (targetId < 0){
        targetId = currentLocationId;
    }
}


function setMaxLengthOfTitle15Characters(string) {
    if (string.length < 15){
        return string;
    }
    let newString = '';
    for (let i = 0; i < 15; i++){
        newString += string[i];
    }
    return newString;
}


function saveSystem(){
    fileSystem.saveInLocalStorage();
    targetId = -1;
}