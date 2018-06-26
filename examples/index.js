/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';


var MobileImgPreviewClipUpload = require('../src/index');


var mip = new MobileImgPreviewClipUpload();


document.getElementById('start').onclick = function () {
    mip.start();
};
