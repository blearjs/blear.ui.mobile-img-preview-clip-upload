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
    onUpload: function (fileInputEl, blob, done) {
        done(new Error('未配置 BLOB 上传'));
    }
};
var reImage = /^image\//;
var w = window;
var URL = w[compatible.js('URL', w)];
var namespace = 'blearui-mobileImgPreviewClipUpload';
var initialTransform = {
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotate: 0
};

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
        var inputFileEl = the[_createInputFileEl]();

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
var _containerEl = sole();
var _cloneEl = sole();
var _cancelBtnEl = sole();
var _restoreBtnEl = sole();
var _completeBtnEl = sole();
var _mask = sole();
var _touchable = sole();
var _createInputFileEl = sole();
var _preview = sole();
var _initClip = sole();
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
var _imageX = sole();
var _imageY = sole();
var _imageScale = sole();
var _imageRoation = sole();
var _clipLeft = sole();
var _clipTop = sole();
var _adaptImageInWindow = sole();
var _adaptImageInClip = sole();
var _transformImage = sole();
var _openUI = sole();
var _closeUI = sole();
var calculateSelection = sole();
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
    the[_containerEl] = selector.query('.' + namespace + '-container', the[_windowContainerEl])[0];
    the[_cloneEl] = selector.query('.' + namespace + '-clone', the[_windowContainerEl])[0];
    var btns = selector.query('.' + namespace + '-btn', the[_windowContainerEl]);
    the[_cancelBtnEl] = btns[0];
    the[_restoreBtnEl] = btns[1];
    the[_completeBtnEl] = btns[2];
    attribute.style(the[_containerEl], {
        width: options.clipWidth,
        height: options.clipHeight
    });
    the[_window].on('open', function (pos) {
        attribute.style(the[_windowContainerEl], {
            width: the[_windowWidth] = pos.width,
            height: the[_windowHeight] = pos.height
        });
        the[_adaptImageInWindow]();
        the[_adaptImageInClip]();
    });
    event.on(the[_cancelBtnEl], 'click', function () {
        the[_closeUI]();
    });
    event.on(the[_restoreBtnEl], 'click', function () {
        attribute.style(the[_imageEl], {
            transform: {
                translateX: 0,
                translateY: 0,
                scale: 1,
                rotate: 0
            }
        });
        attribute.style(the[_cloneEl], {
            transform: {
                translateX: 0,
                translateY: 0,
                scale: 1,
                rotate: 0
            }
        });
        the[_imageX] = the[_imageY] = 0;
        the[_imageScale] = 1;
        the[_imageRoation] = 0;
    });
    event.on(the[_completeBtnEl], 'click', function () {

    });
};

/**
 * 初始化触控
 */
proto[_initTouchable] = function () {
    var the = this;
    var currentX = 0;
    var currentY = 0;
    var transform = function () {
        attribute.style(the[_imageEl], {
            transform: {
                translateX: currentX,
                translateY: currentY
            }
        });
        attribute.style(the[_cloneEl], {
            transform: {
                translateX: currentX,
                translateY: currentY
            }
        });
    };
    // 自动修正，保证图片有完整区域在裁剪区
    var transformEnd = function () {
        if (currentX + the[_clipLeft] > 0) {
            currentX = -the[_clipLeft];
        } else if (currentX - the[_clipLeft] < 0) {
            currentX = the[_clipLeft];
        }

        if (currentY + the[_clipTop] > 0) {
            currentY = -the[_clipTop];
        } else if (currentY - the[_clipTop] < 0) {
            currentY = the[_clipTop];
        }

        the[_imageX] = currentX;
        the[_imageY] = currentY;
        transform();
    };

    the[_touchable] = new Touchable({
        el: the[_windowEl]
    });

    the[_touchable].on('dragMove', function (meta) {
        if (meta.length > 1) {
            return;
        }

        currentX = the[_imageX] + meta.deltaX;
        currentY = the[_imageY] + meta.deltaY;
        transform();
    });

    the[_touchable].on('dragEnd', function (meta) {
        if (meta.length > 1) {
            return;
        }

        transformEnd();
    });

    // the[_touchable].on('pinch', function (meta) {
    //     currentRotation = startRotation + meta.rotation;
    //     currentScale = startScale * meta.scale;
    //     transform();
    // });
    //
    // the[_touchable].on('pinchEnd', function (meta) {
    //     startRotation += meta.rotation;
    //     startScale *= meta.scale;
    // });
};

proto[_initMask] = function () {
    var the = this;
    var options = the[_options];

    the[_mask] = new Mask({
        bgColor: '#000',
        opacity: 1
    });
};


proto[_initNode] = function () {
    var the = this;
    var options = the[_options];


};

proto[_initEvent] = function () {
    var the = this;
    var options = the[_options];

};

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

    the.emit('beforeLoading');
    loader.img(the[_imageURL], function (err, img) {
        if (err) {
            return the.emit('error', err);
        }

        the[_imageNatrualWidth] = img.width;
        the[_imageNatrualHeight] = img.height;
        the[_imageEl] = img;
        the.emit('afterLoading');
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
    var imgRatio = imgWidth / imgHeight;
    var winRatio = winWidth / winHeight;
    var visibleWidth = 0;
    var visibleHeight = 0;
    var fixRatio = 0;

    if (winRatio > imgRatio) {
        visibleHeight = winHeight;
        visibleWidth = visibleHeight * imgRatio;
    } else {
        visibleWidth = winWidth;
        visibleHeight = visibleWidth / imgRatio;
    }

    if (visibleWidth < clipWidth) {
        fixRatio = clipWidth / visibleWidth;
        visibleWidth = clipWidth;
        visibleHeight *= fixRatio;
    }

    if (visibleHeight < clipHeight) {
        fixRatio = clipHeight / visibleHeight;
        visibleHeight = clipHeight;
        visibleWidth *= fixRatio;
    }

    the[_imageScale] = 1;
    the[_imageRoation] = the[_imageX] = the[_imageY] = 0;
    imageEl.className = namespace + '-image';
    attribute.style(imageEl, {
        width: the[_imageWidth] = visibleWidth,
        height: the[_imageHeight] = visibleHeight,
        left: the[_imageLeft] = (winWidth - visibleWidth) / 2,
        top: the[_imageTop] = (winHeight - visibleHeight) / 2,
        transform: initialTransform
    });
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
    // var imageLeft = the[_imageLeft];
    // var imageTop = the[_imageTop];
    // var imageScale = the[_imageScale];
    // var imageRotation = the[_imageRoation];
    attribute.style(the[_cloneEl], {
        width: imageWidth,
        height: imageHeight,
        left: the[_clipLeft] = (clipWidth - imageWidth) / 2,
        top: the[_clipTop] = (clipHeight - imageHeight) / 2,
        transform: initialTransform
    });
};

/**
 * 打开操作界面
 */
proto[_openUI] = function () {
    var the = this;

    modification.insert(the[_imageEl], the[_windowContainerEl], 1);
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
 * 计算选区信息
 */
proto[calculateSelection] = function () {
    var the = this;
    var options = the[_options];
};

MobileImgPreviewClipUpload.defaults = defaults;
module.exports = MobileImgPreviewClipUpload;
require('./style.css', 'css|style');