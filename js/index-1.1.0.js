(function () {

    // 当前链接
    var currentUrl = window.location.href;
    // 打开APP链接
    var openUrl = 'ecton://com.ecton.app/openWeb?url=' + encodeURIComponent(currentUrl);
    // 下载地址（安卓）
    var androidDownloadUrl = 'https://android.myapp.com/myapp/detail.htm?apkName=com.ecton.app&ADTAG=mobile';
    // 下载地址（iOS）
    var iosDownLoadUrl = 'https://apps.apple.com/cn/app/%E5%B1%B1%E4%B8%9C%E4%B8%80%E5%8D%A1%E9%80%9Ae%E7%94%9F%E6%B4%BB/id1380052212';

    // 是否显示
    var showCommonTip = function () {
        let ua = navigator.userAgent,
            isAndroid = /android|adr|linux/gi.test(ua),
            isIOS = /iphone|ipod|ipad/gi.test(ua) && !isAndroid,
            isBlackBerry = /BlackBerry/i.test(ua),
            isWindowPhone = /IEMobile/i.test(ua),
            isMobile = isAndroid || isIOS || isBlackBerry || isWindowPhone;

        // 微信、非一卡通商城
        let isYikatong = /ecton/gi.test(ua); // 判断是否在一卡通 APP 打开
        let isSafari = /safari/gi.test(ua) && !/chrome/gi.test(ua);

        // 情况：1.微信(打开) 2.ios上的浏览器(打开) 3.安卓上的浏览器(打开) 4.老版ios的一卡通(不打开) 5.新版ios的一卡通(不打开) 5.安卓的一卡通(不打开)
        if (/MicroMessenger/i.test(ua) || (isIOS && isSafari) || (isAndroid && !isYikatong)) {
            $('#m_common_tip').css('display', 'flex');
        }

        // if (/MicroMessenger/i.test(ua) || (isMobile && (!isYikatong || !isSafari))) {
        //     $('#m_common_tip').css('display', 'flex');
        // }

        // 奇葩的要求
        // if (/MicroMessenger/i.test(ua) === false && (isMobile && !isYikatong)) {
        //     $('#m_common_tip .content-right').click();
        // }
    };

    /**
     * 判断手机上是否安装了app，如果安装直接打开url，如果没安装，执行callback
     */
    var openApp = function (url, callback) {

        // 唤起 APP，如果被唤起的话，页面就会进入后台运行，setInterval 在 ios 中不会停止运行，在 android 中停止运行
        window.location.href = url;

        const initialTime = new Date();

        let counter = 0;
        let waitTime = 0;

        // 每 20ms 执行一次，执行 100次 在页面中实际耗费与 2000 ms 不会相差多少。
        // 我们的判断条件比预期时间多设置了 500ms，所以如果安卓中 setInterval 内的函数执行 100 次以内所费时间超过 2500ms，
        // 则说明 APP 唤起成功，反之则代表失败。
        const checkOpen = setInterval(() => {

            counter++;

            waitTime = new Date() - initialTime;

            if (waitTime > 2500) {
                clearInterval(checkOpen);
                callback && callback(); // 唤端失败的回调函数
            }

            if (counter < 100) return;

            // 通过 document.hidden 和 document.webkitHidden 属性来判断 APP 在 ios 中是否被正常唤起
            // 2000ms 内，页面转入后台运行，document.hidden 会返回 true，代表唤端成功，反之则代表失败
            const hide = document.hidden || document.webkitHidden;

            console.log(hide);

            if (!hide) {
                clearInterval(checkOpen);
                callback && callback(); // 唤端失败的回调函数
            }

        }, 20);

    }

    $(document).ready(function () {

        // 点击打开事件绑定
        $('#m_common_tip .content-right').on('click', function () {
            let elementTarget = this;
            let ua = navigator.userAgent;
            let isWeiXin = /MicroMessenger/i.test(ua);

            if (isWeiXin) {
                // 显示提示遮罩，提示在内置浏览器中打开
                $('#m_common_tip_mask').css('display', 'block');
            } else {
                // 打开APP，失败则去下载页面
                console.log('打开APP，失败则去下载页面');
                $(elementTarget).text('正在打开...');
                openApp(openUrl, function () {
                    if (/android|adr|linux/gi.test(ua)) {
                        console.log('打开安卓应用市场');
                        window.location.href = androidDownloadUrl;
                    } else {
                        console.log('打开AppStore');
                        window.location.href = iosDownLoadUrl;
                    }
                });
            }
        })

        // 点击取消
        $('#m_common_tip .tip-close-btn').on('click', function () {
            $('#m_common_tip').css('display', 'none');
        })

        // 点击遮罩关闭提示
        $('#m_common_tip_mask').on('click', function () {
            $('#m_common_tip_mask').css('display', 'none');
        })

        // 是否显示
        showCommonTip();
    });
})()