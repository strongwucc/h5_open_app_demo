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
     * 判断手机版本
     */
    var detectVersion = function () {
        let isAndroid, isIOS, isIOS9, version,
            u = navigator.userAgent,
            ua = u.toLowerCase();

        if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) { //android终端或者uc浏览器
            //Android系统
            isAndroid = true
        }

        if (ua.indexOf("like mac os x") > 0) {
            //ios
            var regStr_saf = /os [\d._]*/gi;
            var verinfo = ua.match(regStr_saf);
            version = (verinfo + "").replace(/[^0-9|_.]/ig, "").replace(/_/ig, ".");
        }
        var version_str = version + "";
        if (version_str != "undefined" && version_str.length > 0) {
            version = parseInt(version)
            if (version >= 8) {
                // ios9以上
                isIOS9 = true
            } else {
                isIOS = true
            }
        }
        return {
            isAndroid,
            isIOS,
            isIOS9
        }
    }

    /**
     * 判断手机上是否安装了app，如果安装直接打开url，如果没安装，执行callback
     */
    var openApp = function (url, callback) {
        let {
            isAndroid,
            isIOS,
            isIOS9
        } = detectVersion()
        if (isAndroid || isIOS) {
            var timeout, t = 2000,
                hasApp = true;
            var openScript = setTimeout(function () {
                if (!hasApp) {
                    callback && callback()
                }
                document.body.removeChild(ifr);
            }, 3000)

            var t1 = Date.now();
            var ifr = document.createElement("iframe");
            ifr.setAttribute('src', url);
            ifr.setAttribute('style', 'display:none');
            document.body.appendChild(ifr);

            timeout = setTimeout(function () {
                var t2 = Date.now();
                if (t2 - t1 < t + 100) {
                    hasApp = false;
                }
            }, t);
        }

        if (isIOS9) {
            location.href = url;
            setTimeout(function () {
                callback && callback()
            }, 2000);
            setTimeout(function () {
                location.reload();
            }, 3000);
        }
    }

    $(document).ready(function () {

        // 点击打开
        $('#m_common_tip .content-right').on('click', function () {
            let elementTarget = this;
            let ua = navigator.userAgent;
            let isWeiXin = /MicroMessenger/i.test(ua);

            // 判断是否登录，isUserLogin 这个参数是 详情页面 goods.detail.new.js 里面的变量
            // if (!isUserLogin) {
            //     if (isWeiXin) {
            //         let k = getCookie("isTourist"); // getCookie 是 goods.detail.new.js 里面的方法
            //         window.location.href = GLOBAL_INFO.COMMON_URI + "/register.html?k=" + k + "&url_jump=" + window.location.href;
            //     } else {
            //         window.location.href = GLOBAL_INFO.COMMON_URI + "/login.html?url_jump=" + window.location.href;
            //     }
            // }

            if (isWeiXin) {
                // 显示提示遮罩，提示在内置浏览器中打开
                $('#m_common_tip_mask').css('display', 'block');
            } else {
                // 打开APP，失败则去下载页面
                console.log('打开APP，失败则去下载页面');
                // window.location.href = 'ecton://com.ecton.app/openWeb?url=' + currentUrl;
                $(elementTarget).text('正在打开...');
                openApp(openUrl, function () {
                    let {
                        isAndroid,
                        isIOS,
                        isIOS9
                    } = detectVersion();
                    if (isAndroid) {
                        console.log('打开安卓应用市场');
                        window.location.href = androidDownloadUrl;
                    } else {
                        console.log('打开App Store');
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