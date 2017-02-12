"use strict";


const express = require('express');
const open = require('open');
const path = require('path');
let app = express();

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname +'index.html'));
});

app.listen(8080, function () {
});

open("127.0.0.1:8080", 'chrome');
