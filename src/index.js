/**
 * blear.ui.mobile-img-peview-clip-upload
 * @author ydr.me
 * @create 2018年06月26日13:55:03
 */

'use strict';

var UI = require('blear.ui');
var Window = require('blear.ui.window');
var Mask = require('blear.ui.mask');
var object = require('blear.utils.object');
var modification = require('blear.core.modification');
var event = require('blear.core.event');
var attribute = require('blear.core.attribute');
var selector = require('blear.core.selector');
var compatible = require('blear.utils.compatible');
var loader = require('blear.utils.loader');
var canvasImage = require('blear.utils.canvas-img');
var canvasContent = require('blear.utils.canvas-content');
var Touchable = require('blear.classes.touchable');

var defaults = {
    /**
     * 裁剪区域宽度
     */
    clipWidth: 100,

    /**
     * 裁剪区域高度
     */
    clipHeight: 100,

    /**
     * 期望图片宽度
     */
    expectWidth: 800,

    /**
     * 期望图片高度
     */
    expectHeight: 800,

    /**
     * input:file 的 name
     */
    fileName: 'file',

    // 必须是清晰的约束条件
    // @link http://frontenddev.org/article/under-the-chrome-input-file-accept-constraints-lead-to-pop-up-response-is-slow.html
    fileAccept: 'image/png,image/jpg,image/jpeg,image/bmp',

    /**
     * 图片扩展名，使用英文逗号分隔开
     * @type String
     */
    fileExtension: '.png,.jpg,.jpeg,.bmp',

    /**
     * 绘制的图片质量
     * @type Number
     */
    drawQuality: 0.8,

    /**
     * 绘制的图片类型
     * @type String
     */
    drawType: 'image/jpeg',

    /**
     * 遮罩配置
     */
    maskOptions: {
        bgColor: '#000',
        opacity: 0.85
    },

    /**
     * 图片覆盖的颜色
     */
    coverColor: '#000',

    /**
     * 图片覆盖的透明度
     */
    coverOpacity: 0.382,

    /**
     * 上传
     * @param fileInputEl
     * @param blob
     * @param done
     */
    onUpload: function (fileInputEl, blob, done) {
        done(new Error('未配置 BLOB 上传'));
    }
};
var reImage = /^image\//;
var w = window;
var URL = w[compatible.js('URL', w)];
var namespace = 'blearui-mobileImgPreviewClipUpload';
var canvasEl = modification.create('canvas');

// canvasEl.style.outline = '2px solid #f00';
// modification.insert(canvasEl);

var MobileImgPreviewClipUpload = UI.extend({
    className: 'MobileImgPreviewClipUpload',
    constructor: function (options) {
        var the = this;

        options = the[_options] = object.assign({}, defaults, options);
        MobileImgPreviewClipUpload.parent(the);
        the[_reExtension] = new RegExp('\\.(' + options.fileExtension.replace(/,/g, '|').replace(/\./g, '') + ')$', 'i');
        the[_initWindow]();
        the[_initTouchable]();
        the[_initMask]();
        the[_initNode]();
        the[_initEvent]();
    },

    /**
     * 开始
     * @returns {MobileImgPreviewClipUpload}
     */
    start: function () {
        var the = this;
        var inputFileEl = the[_inputFileEl] = the[_createInputFileEl]();

        inputFileEl.onchange = function () {
            var value = inputFileEl.value;

            if (!value) {
                return;
            }

            the[_preview](inputFileEl);
        };
        event.emit(inputFileEl, event.create('click', MouseEvent));
        return the;
    }
});
var sole = MobileImgPreviewClipUpload.sole;
var _options = sole();
var _reExtension = sole();
var _initNode = sole();
var _initEvent = sole();
var _initWindow = sole();
var _initMask = sole();
var _initTouchable = sole();
var _window = sole();
var _windowEl = sole();
var _windowContainerEl = sole();
var _coverEl = sole();
var _containerEl = sole();
var _cliperEl = sole();
var _cloneEl = sole();
var _cancelBtnEl = sole();
var _restoreBtnEl = sole();
var _completeBtnEl = sole();
var _mask = sole();
var _touchable = sole();
var _createInputFileEl = sole();
var _inputFileEl = sole();
var _preview = sole();
var _imageURL = sole();
var _imageEl = sole();
var _loadImage = sole();
var _imageNatrualWidth = sole();
var _imageNatrualHeight = sole();
var _windowWidth = sole();
var _windowHeight = sole();
var _imageWidth = sole();
var _imageHeight = sole();
var _imageLeft = sole();
var _imageTop = sole();
var _imageTranslateX = sole();
var _imageTranslateY = sole();
var _imageScale = sole();
var _imageMinScale = sole();
var _imageRotation = sole();
var _imageCenterLeft = sole();
var _imageCenterTop = sole();
var _clipLeft = sole();
var _clipTop = sole();
var _adaptImageInWindow = sole();
var _adaptImageInClip = sole();
var _openUI = sole();
var _closeUI = sole();
var _calculateImageCenter = sole();
var _calculateSelection = sole();
var _upload = sole();
var proto = MobileImgPreviewClipUpload.prototype;

proto[_initWindow] = function () {
    var the = this;
    var options = the[_options];

    the[_window] = new Window({
        addClass: namespace,
        width: '100%',
        height: '100%'
    });
    the[_window].setHTML(require('./template.html'));
    the[_windowEl] = the[_window].getWindowEl();
    the[_windowContainerEl] = the[_window].getContainerEl();
    the[_coverEl] = selector.query('.' + namespace + '-cover', the[_windowContainerEl])[0];
    the[_containerEl] = selector.query('.' + namespace + '-container', the[_windowContainerEl])[0];
    the[_cliperEl] = selector.query('.' + namespace + '-cliper', the[_windowContainerEl])[0];
    the[_cloneEl] = selector.query('.' + namespace + '-clone', the[_windowContainerEl])[0];
    var btns = selector.query('.' + namespace + '-btn', the[_windowContainerEl]);
    the[_cancelBtnEl] = btns[0];
    the[_restoreBtnEl] = btns[1];
    the[_completeBtnEl] = btns[2];
    attribute.style(the[_coverEl], {
        background: options.coverColor,
        opacity: options.coverOpacity
    });
    attribute.style(the[_cliperEl], {
        width: options.clipWidth,
        height: options.clipHeight
    });
    the[_window].on('open', function (pos) {
        var size = {
            width: the[_windowWidth] = pos.width,
            height: the[_windowHeight] = pos.height
        };
        attribute.style(the[_windowContainerEl], size);
        attribute.style(the[_containerEl], size);
        the[_imageEl].className = namespace + '-image';
        the[_imageRotation] = 0;
        the[_adaptImageInWindow]();
        the[_adaptImageInClip]();
    });
    event.on(the[_cancelBtnEl], 'click', function () {
        the[_closeUI]();
    });
    event.on(the[_restoreBtnEl], 'click', function () {
        the[_imageRotation] = 0;
        the[_adaptImageInWindow]();
        the[_adaptImageInClip]();
    });
    event.on(the[_completeBtnEl], 'click', function () {
        the[_upload]();
    });
};

/**
 * 初始化触控
 */
proto[_initTouchable] = function () {
    var the = this;
    var options = the[_options];
    var clipWidth = options.clipWidth;
    var clipHeight = options.clipHeight;
    var currentX = 0;
    var currentY = 0;
    var currentS = 1;
    var currentR = 0;
    var transform = function () {
        var style = {
            transform: {
                translateX: currentX,
                translateY: currentY,
                scale: currentS,
                rotate: currentR
            }
        };
        attribute.style(the[_imageEl], style);
        attribute.style(the[_coverEl], style);
        attribute.style(the[_cloneEl], style);
    };
    // 自动修正：保证图片有完整区域在裁剪区
    var transformEnd = function () {
        switch (the[_imageRotation]) {
            case 0:
            case 180:
                the[_clipLeft] = (the[_imageWidth] * the[_imageScale] - clipWidth) / 2;
                the[_clipTop] = (the[_imageHeight] * the[_imageScale] - clipHeight) / 2;
                break;

            case 90:
            case 270:
                the[_clipLeft] = (the[_imageHeight] * the[_imageScale] - clipWidth) / 2;
                the[_clipTop] = (the[_imageWidth] * the[_imageScale] - clipHeight) / 2;
                break;
        }

        if (currentX - the[_clipLeft] > 0) {
            currentX = the[_clipLeft];
        } else if (currentX + the[_clipLeft] < 0) {
            currentX = -the[_clipLeft];
        }

        if (currentY - the[_clipTop] > 0) {
            currentY = the[_clipTop];
        } else if (currentY + the[_clipTop] < 0) {
            currentY = -the[_clipTop];
        }

        the[_imageTranslateX] = currentX;
        the[_imageTranslateY] = currentY;
        transform();
    };
    // 自动修正：保证图片是水平或垂直的
    var pinchEnd = function () {
        // 1: 旋转修正
        currentR %= 360;

        // 负值修正
        if (currentR < 0) {
            currentR += 360;
        }

        // 0: < 45 || >= 315
        // 90: >= 45 && < 135
        // 180: >= 135 && < 225
        // 270: >= 225 && < 315
        if (currentR >= 45 && currentR < 135) {
            currentR = 90;
        } else if (currentR >= 135 && currentR < 225) {
            currentR = 180;
        } else if (currentR >= 225 && currentR < 315) {
            currentR = 270;
        } else {
            currentR = 0;
        }

        // 2：缩放修正
        if (currentS < the[_imageMinScale]) {
            currentS = the[_imageMinScale];
        }

        // 仅缩放不旋转
        if (currentR === the[_imageRotation]) {
            the[_imageScale] = currentS;
            transform();
        }
        // 仅旋转不缩放
        else {
            the[_imageRotation] = currentR;
            currentS = 1;
            // 旋转之后重新适配到中心最大化
            the[_adaptImageInWindow]();
            the[_adaptImageInClip]();
        }
    };

    the[_touchable] = new Touchable({
        el: the[_containerEl]
    });

    the[_touchable].on('dragStart', function () {
        // 其他地方可能修改该值，因此这里需要同步
        currentS = the[_imageScale];
        currentR = the[_imageRotation];
    });

    the[_touchable].on('dragMove', function (meta) {
        if (meta.length > 1) {
            return;
        }

        currentX = the[_imageTranslateX] + meta.deltaX;
        currentY = the[_imageTranslateY] + meta.deltaY;
        transform();
    });

    the[_touchable].on('dragEnd', function (meta) {
        transformEnd();
    });

    the[_touchable].on('pinch', function (meta) {
        currentR = the[_imageRotation] + meta.rotation;
        currentS = the[_imageScale] * meta.scale;
        transform();
    });

    the[_touchable].on('pinchEnd', function (meta) {
        pinchEnd();
    });
};

/**
 * 初始化遮罩
 */
proto[_initMask] = function () {
    var the = this;
    var options = the[_options];

    the[_mask] = new Mask(options.maskOptions);
};


proto[_initNode] = function () {
    var the = this;
    var options = the[_options];


};

proto[_initEvent] = function () {
    var the = this;
    var options = the[_options];

};

/**
 * 创建 input:file
 * @returns {Node}
 */
proto[_createInputFileEl] = function () {
    var the = this;
    var options = the[_options];
    var properties = {
        name: options.fileName,
        accept: options.fileAccept,
        multiple: false,
        type: 'file',
        tabIndex: -1,
        style: {
            display: 'none'
        }
    };
    var inputFileEl = modification.create('input', properties);
    modification.insert(inputFileEl);
    return inputFileEl;
};

/**
 * 预览图片
 * @param inputEl
 */
proto[_preview] = function (inputEl) {
    var the = this;
    var value = inputEl.value;

    if (!value) {
        err = new Error('文件不存在');
        err.type = 'empty';
        the.emit('error', err);
        return;
    }

    if (!the[_reExtension].test(value)) {
        err = new Error('文件类型不是图片');
        err.type = 'type';
        the.emit('error', err);
        return;
    }

    if (!inputEl.files) {
        err = new Error('文件不存在');
        err.type = 'empty';
        the.emit('error', err);
        return;
    }

    var file = inputEl.files[0];
    var err;

    if (!file) {
        err = new Error('文件为空');
        err.type = 'empty';
        the.emit('error', err);
        return;
    }

    if (!reImage.test(file.type)) {
        err = new Error('文件类型不是图片');
        err.type = 'type';
        the.emit('error', err);
        return;
    }

    the[_imageURL] = URL.createObjectURL(file);
    the[_loadImage]();
};


/**
 * 加载图片
 */
proto[_loadImage] = function () {
    var the = this;

    the.emit('beforeLoad');
    loader.img(the[_imageURL], function (err, img) {
        if (err) {
            return the.emit('error', err);
        }

        the[_imageNatrualWidth] = img.width;
        the[_imageNatrualHeight] = img.height;
        the[_imageEl] = img;
        the.emit('afterLoad');
        the[_openUI]();
    });
};

/**
 * 在窗口内适配图片
 */
proto[_adaptImageInWindow] = function () {
    var the = this;
    var options = the[_options];
    var clipWidth = options.clipWidth;
    var clipHeight = options.clipHeight;
    var imgWidth = the[_imageNatrualWidth];
    var imgHeight = the[_imageNatrualHeight];
    var winWidth = the[_windowWidth];
    var winHeight = the[_windowHeight];
    var imageEl = the[_imageEl];
    var imgRatio = 1;
    var winRatio = winWidth / winHeight;
    var displayWidth = 0;
    var displayHeight = 0;
    var fixRatio = 0;
    var vertical = false;

    switch (the[_imageRotation]) {
        case 0:
        case 180:
            imgRatio = imgWidth / imgHeight;
            break;

        case 90:
        case 270:
            imgRatio = imgHeight / imgWidth;
            vertical = true;
            break;
    }

    if (winRatio > imgRatio) {
        displayHeight = winHeight;
        displayWidth = displayHeight * imgRatio;
    } else {
        displayWidth = winWidth;
        displayHeight = displayWidth / imgRatio;
    }

    if (displayWidth < clipWidth) {
        fixRatio = clipWidth / displayWidth;
        displayWidth = clipWidth;
        displayHeight *= fixRatio;
    }

    if (displayHeight < clipHeight) {
        fixRatio = clipHeight / displayHeight;
        displayHeight = clipHeight;
        displayWidth *= fixRatio;
    }

    the[_imageScale] = 1;
    the[_imageMinScale] = Math.max(clipWidth / displayWidth, clipHeight / displayHeight);
    the[_imageTranslateX] = 0;
    the[_imageTranslateY] = 0;
    var style = {
        width: the[_imageWidth] = vertical ? displayHeight : displayWidth,
        height: the[_imageHeight] = vertical ? displayWidth : displayHeight,
        left: the[_imageLeft] = (winWidth - the[_imageWidth]) / 2,
        top: the[_imageTop] = (winHeight - the[_imageHeight]) / 2,
        transform: {
            rotate: the[_imageRotation],
            scale: 1,
            translateX: 0,
            translateY: 0
        }
    };
    attribute.style(the[_coverEl], style);
    attribute.style(imageEl, style);
};


/**
 * 在裁剪窗口适配图片
 */
proto[_adaptImageInClip] = function () {
    var the = this;
    var options = the[_options];
    var clipWidth = options.clipWidth;
    var clipHeight = options.clipHeight;
    var imageWidth = the[_imageWidth];
    var imageHeight = the[_imageHeight];
    var centerLeft = the[_clipLeft] = (imageWidth - clipWidth) / 2;
    var centerTop = the[_clipTop] = (imageHeight - clipHeight) / 2;

    the[_calculateImageCenter]();
    attribute.style(the[_cloneEl], {
        width: imageWidth,
        height: imageHeight,
        left: -centerLeft,
        top: -centerTop,
        transform: {
            rotate: the[_imageRotation],
            scale: 1,
            translateX: 0,
            translateY: 0
        }
    });
};

/**
 * 打开操作界面
 */
proto[_openUI] = function () {
    var the = this;

    modification.insert(the[_imageEl], the[_containerEl], 1);
    the[_cloneEl].src = the[_imageURL];
    the[_mask].open();
    the[_window].open();
};

/**
 * 关闭操作界面
 */
proto[_closeUI] = function () {
    var the = this;

    modification.remove(the[_imageEl]);
    // the[_cloneEl].src = '';
    the[_mask].close();
    the[_window].close();
};

/**
 * 计算图片在裁剪区域中心的坐标
 */
proto[_calculateImageCenter] = function () {
    var the = this;
    var options = the[_options];
    var imageWidth = the[_imageWidth];
    var imageHeight = the[_imageHeight];

    switch (the[_imageRotation]) {
        case 0:
        case 180:
            the[_imageCenterLeft] = imageWidth / 2;
            the[_imageCenterTop] = imageHeight / 2;
            break;

        case 90:
        case 270:
            the[_imageCenterLeft] = imageHeight / 2;
            the[_imageCenterTop] = imageWidth / 2;
            break;
    }
};

/**
 * 计算选区信息
 */
proto[_calculateSelection] = function () {
    var the = this;
    var options = the[_options];
    var imageScale = the[_imageScale];
    var displayScale = the[_imageWidth] / the[_imageNatrualWidth];
    var clipWidth = options.clipWidth;
    var clipHeight = options.clipHeight;
    var expectWidth = options.expectWidth;
    var expectHeight = options.expectHeight;
    var srcLeft = 0;
    var srcTop = 0;
    var srcWidth = 0;
    var srcHeight = 0;
    var rotation = the[_imageRotation];
    var drawWidth = 0;
    var drawHeight = 0;
    var drawTranslateX = 0;
    var drawTranslateY = 0;
    var imageOriginWidth = the[_imageWidth];
    var imageOriginHeight = the[_imageHeight];
    var clipOriginLeft = (the[_clipLeft] - the[_imageTranslateX]) / imageScale;
    var clipOriginTop = (the[_clipTop] - the[_imageTranslateY]) / imageScale;
    var clipOriginWidth = clipWidth / imageScale;
    var clipOriginHeight = clipHeight / imageScale;

    switch (rotation) {
        case 0:
            srcLeft = clipOriginLeft;
            srcTop = clipOriginTop;
            srcWidth = clipOriginWidth;
            srcHeight = clipOriginHeight;
            drawWidth = expectWidth;
            drawHeight = expectHeight;
            break;

        case 90:
            srcLeft = clipOriginTop;
            srcTop = imageOriginHeight - clipOriginLeft - clipOriginWidth;
            srcWidth = clipOriginHeight;
            srcHeight = clipOriginWidth;
            drawWidth = expectHeight;
            drawHeight = expectWidth;
            drawTranslateX = expectWidth;
            break;

        case 180:
            srcLeft = imageOriginWidth - clipOriginLeft - clipOriginWidth;
            srcTop = imageOriginHeight - clipOriginTop - clipOriginHeight;
            srcWidth = clipOriginWidth;
            srcHeight = clipOriginHeight;
            drawWidth = expectWidth;
            drawHeight = expectHeight;
            drawTranslateX = expectWidth;
            drawTranslateY = expectHeight;
            break;

        case 270:
            srcLeft = imageOriginWidth - clipOriginTop - clipOriginHeight;
            srcTop = clipOriginLeft;
            srcWidth = clipOriginHeight;
            srcHeight = clipOriginWidth;
            drawWidth = expectHeight;
            drawHeight = expectWidth;
            drawTranslateY = expectHeight;
            break;
    }

    return {
        srcLeft: srcLeft / displayScale,
        srcTop: srcTop / displayScale,
        srcWidth: srcWidth / displayScale,
        srcHeight: srcHeight / displayScale,
        drawWidth: drawWidth,
        drawHeight: drawHeight,
        drawTranslateX: drawTranslateX,
        drawTranslateY: drawTranslateY,
        drawRadian: rotation * Math.PI / 180,
        actualWidth: expectWidth,
        actualHeight: expectHeight
    };
};

/**
 * 上传
 */
proto[_upload] = function () {
    var the = this;
    var options = the[_options];
    var sel = the[_calculateSelection]();
    var ctx = canvasEl.getContext('2d');

    canvasEl.width = sel.actualWidth;
    canvasEl.height = sel.actualHeight;
    ctx.save();
    ctx.translate(sel.drawTranslateX, sel.drawTranslateY);
    ctx.rotate(sel.drawRadian);
    canvasImage.draw(canvasEl, the[_imageEl], sel);
    ctx.restore();
    the.emit('beforeUpload');
    canvasContent.toBlob(canvasEl, {
        type: options.drawType,
        quality: options.drawQuality
    }, function (blob) {
        the[_options].onUpload(the[_inputFileEl], blob, function (err, url) {
            if (err) {
                the.emit('error', err);
                return;
            }

            the[_closeUI]();
            the.emit('afterUpload', url);
        });
    });
};

MobileImgPreviewClipUpload.defaults = defaults;
module.exports = MobileImgPreviewClipUpload;
require('./style.css', 'css|style');