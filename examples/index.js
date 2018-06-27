/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';


var MobileImgPreviewClipUpload = require('../src/index');


var mip = new MobileImgPreviewClipUpload({
    clipWidth: 300,
    clipHeight: 200,
    expectWidth: 600,
    expectHeight: 400
});

document.getElementById('start').onclick = function () {
    mip.start();
};

mip.on('error', function (err) {
    alert(err.message);
});
