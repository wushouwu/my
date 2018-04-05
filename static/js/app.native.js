(function() {
    /**
     *Json对象的浅拷贝
     *      返回具有父类属性的新的child对象
     * @param {Object} parent
     * @param {Object} child
     */
    function extend(parent, child) {
        var child = child || {};
        for (var prop in parent) {
            if (typeof(child[prop]) == "undefined")
                child[prop] = parent[prop];
        }
        return child;
    }


    window.Mix = window.Mix || {};
    window.Mix.app = {}; //app操作对象
    window.Mix.page = {}; //页面操作对象
    window.Mix.net = {}; // 网络请求操作
    window.Mix.debug = {
        /***************** start 此部分为浏览器调试需要填充的部分,真实发布时请去除测试数据   *********************/
        //测试用户名       eg:"admin"
        __testUserName: "admin",
        // 测试密码        eg:"123456"
        __testPassword: "mix123456",
        // 测试设备信息     eg: {system:"Android", version:"7.0", IMEI:"45454236743453", brand:"Xiaomi", model:"MI6", language:"zh"}
        __testDevice: { system: "Android", version: "7.0", IMEI: "45454236743453", brand: "Xiaomi", model: "MI6", language: "zh" },
        // 测试APP信息          eg: {version_name:"v3.2.2", version_code:"30021", name:"智物联demo",package:"com.mixlinker.framework.v3" }
        __testApp: { version_name: "v3.2.2", version_code: "30021", name: "智物联demo", package: "com.mixlinker.framework.v3" },
        // 测试用户信息        eg: {user_identify:"1000001"}
        __testUser: { user_identify: "1000001" },
        //  测试FIDIS地址 eg: "http://demo.fidis.cn/fidis.v2"
        __testFidisPath: 'http://'+location.host+location.pathname,
        // MqttIp eg: "192.168.1.198"
        __testMqttIp: "192.168.1.198",
        // MqttPort eg: "1883"
        __testMqttPort: "1883",
        // FidisID eg: "fidis_test"
        __testFidisID: "fidis_test",
        /**********************************  end  ********************************************/
    }
    window.Mix.info = {
        /*是否是app*/
        isAPP: !!(navigator.userAgent.match(/mixlinker/)),
        /*是否是苹果设备*/
        isIOS: !!(navigator.userAgent.match(/mixlinkerIOS/)),
        /*是否是安卓设备*/
        isAndroid: !!(navigator.userAgent.match(/mixlinkerAndroid/)),
        /*设备信息*/
        device: !!(navigator.userAgent.match(/mixlinker/)) ? JSON.parse(prompt("mixlinker", "mixDevice")) : Mix.debug.__testDevice,
        /*app信息*/
        app: !!(navigator.userAgent.match(/mixlinker/)) ? JSON.parse(prompt("mixlinker", "mixApp")) : Mix.debug.__testApp,
        /*用户名*/
        username: !!(navigator.userAgent.match(/mixlinker/)) ? prompt("mixlinker", "mixUsername") : Mix.debug.__testUserName,
        /*密码*/
        password: !!(navigator.userAgent.match(/mixlinker/)) ? prompt("mixlinker", "mixPassword") : Mix.debug.__testPassword,
        /*用户信息*/
        user: !!(navigator.userAgent.match(/mixlinker/)) ? JSON.parse(prompt("mixlinker", "mixUserInfo")) : Mix.debug.__testUser,
        /*获取fidis地址*/
        fidisPath: !!(navigator.userAgent.match(/mixlinker/)) ? prompt("mixlinker", "mixFidisPath") : Mix.debug.__testFidisPath,
        /*获取MqttIp*/
        mqttIp: !!(navigator.userAgent.match(/mixlinker/)) ? prompt("mixlinker", "mixMqttIp") : Mix.debug.__testMqttIp,
        /*获取MqttPort*/
        mqttPort: !!(navigator.userAgent.match(/mixlinker/)) ? prompt("mixlinker", "mixMqttPort") : Mix.debug.__testMqttPort,
        /*获取FidisID*/
        fidisID: !!(navigator.userAgent.match(/mixlinker/)) ? prompt("mixlinker", "mixFidisID") : Mix.debug.__testFidisID,
    };

    if (!Mix.info.isAPP) {
        if (Mix.debug.__testApp && Mix.debug.__testDevice && Mix.debug.__testFidisPath && Mix.debug.__testPassword && Mix.debug.__testUser && Mix.debug.__testUserName) {

        } else {
            alert("要在浏览器上进行调试时，请填写Native.js  23-36行数据");
            return;
        }
    }

    /*回调方法的集合*/
    window.Mix.__callback = Mix.__callback || {};
    /*当前js版本*/
    window.Mix.version = "v2.0.3";
    /*回调方法计数器*/
    window.Mix.__callbackCount = 0;

    /*当前iframe的目录层级名称*/
    window.Mix.__frameTree = (function() {
        var me = window;
        var str = "";
        while (me.self != top) {
            if (me.name == "") {
                me.name = "_mix_cache_frame_name_" + Math.random() * 100000;
            }
            if (str == "") {
                str = me.name + str;
            } else {
                str = me.name + "." + str;
            }
            me = me.parent;
        }
        if (str == "") {
            str = "window";
        }
        return str;
    })();

    window.addEventListener("message", function(e) {
    	if(e.origin=='http://x.hao61.net'||e.origin=='http://pos.baidu.com'){
    		console.log(e);
    		return ;
    	}
        e = e || event;
        //var data = JSON.parse(e.data);  // {id:xxxxx, body:xxxx}
        var data = e.data;
        var fun = Mix.__callback[data.id];
        if (typeof(fun) == "string") {
            if (fun.indexOf("(") > 0 && fun.indexOf(")") > 0) {
                eval(fun);
            } else if (typeof data.body == "string") {
                eval(fun + "('" + data.body + "')");
            } else if (typeof data.body != "object") {
                eval(fun + "(" + JSON.stringify(data.body) + ")");
            } else if (typeof data.body == "number" || typeof data.body == "boolean") {
                eval(fun + "(" + data.body + ")");
            } else {
                eval(fun + "()");
            }
        } else {
            fun(data.body);
        }
        if ((data.id + "").length > 4) { // 当id长度大于4时移除回调，因为大于4时回调属于临时性的
            delete Mix.__callback[data.id];
        }
    });

    /**
     * 反射回调本地方法
     * @param funName   方法名称
     * @param params    参数
     * @param callback  回调方法
     */
    window.Mix.call = function(funName, params, callback) {
        if (Mix.info.app.version_code < 30014) {
            alert("版本太低");
            // 采用之前的调用方式
            funName = "mix" + funName;
        } else {
            // 采用新版调用方式
            var id = "";
            if (typeof params == "undefined") {
                params = {};
            }
            if (callback) {
                id = new Date().getTime() + "_" + Mix.__callbackCount++;
                Mix.__callback[id] = callback;
                params.callback = Mix.__frameTree;
                params.id = id;
            }
            if (Mix.info.isAndroid) {
                var call = {
                    name: funName,
                    params: params,
                    //frame: Mix.frame,
                    //id: id
                };
                mixlinker.call(JSON.stringify(call));
            } else if (Mix.info.isIOS) {
                var call = {
                    name: funName,
                    params: params
                }
                window.webkit.messageHandlers.call.postMessage(JSON.stringify(call));
            }
        }
    };

    /**
     * 数据库操作对象
     * @type {{init: Mix.db.init, insert: mixDbInsert, delete: mixDbDelete, update: mixDbUpdate, select: mixDbSelect, execute: mixDbExecute}}
     */
    window.Mix.db = {
        /**
         * 初始化数据库
         * @param databaseName  数据库名
         * @param version       版本号
         * @param onCreate      初始化的回调 (databaseName, version)
         * @param onUpdate      版本升级的回调 (databaseName, oldversion, newversion)
         * @param onError       初始化失败的回调  (databaseName, msg)
         * databaseName, version, onCreate, onUpdate, onError
         */
        init: function(params) {
            var defaults = {
                databaseName: "base",
                version: 1,
                onCreate: null,
                onUpdate: null,
                onError: null,
            }
            extend(defaults, params);
            if (parseInt(params.version) != params.version || params.version <= 0) {
                params.onError("version只能为大于0的整形数字");
                return;
            }
            Mix.db.execute({
                databaseName: params.databaseName,
                sql: "PRAGMA user_version;",
                callback: function(result) {
                    if (result.status) {
                        var dbVersion = result.result[0].user_version;
                        if (dbVersion <= 0) {
                            Mix.db.execute({
                                databaseName: params.databaseName,
                                sql: "PRAGMA user_version=" + params.version + ";",
                                callback: function(res) {
                                    if (res.status) {
                                        params.onCreate(params.databaseName, params.version);
                                    } else {
                                        params.onError(params.databaseName, res.msg);
                                    }
                                }
                            });
                        } else if (dbVersion < params.version) {
                            Mix.db.execute({
                                databaseName: params.databaseName,
                                sql: "PRAGMA user_version=" + params.version + ";",
                                callback: function(res) {
                                    if (res.status) {
                                        params.onUpdate(params.databaseName, dbVersion, params.version);
                                    } else {
                                        params.onError(res.msg);
                                    }
                                }
                            });
                        } else if (dbVersion > params.version) {
                            params.onError("已存在版本为" + dbVersion + "的数据库！");
                        }
                    }
                }
            });
        },
        insert: mixDbInsert,
        delete: mixDbDelete,
        update: mixDbUpdate,
        select: mixDbSelect,
        execute: mixDbExecute
    };


    /**
     * 插入数据表
     * @param databaseName 数据库名
     * @param tableName 表名
     * @param values    插入的数据：{name:"zhangsan",age:12, sex:1, enabled: true}
     * @param callback  插入回调
     * databaseName, tableName, values, callback
     */
    function mixDbInsert(params) {
        var defaults = {
            databaseName: "base",
            tableName: null,
            values: null,
            callback: null,
        }
        extend(defaults, params);
        if (params.tableName == null) {
            throw "no params tableName";
        }
        if (typeof(params.values) != "object") {
            throw "err params type: values";
        }

        var sql = "INSERT INTO " + params.tableName + " (";
        var bindArgs = "";
        var i = 0;
        for (var colName in params.values) {
            sql += i > 0 ? "," : "";
            sql += "`" + colName + "`";
            bindArgs += i > 0 ? "," : "";
            var type = typeof(params.values[colName]);
            if (type == "number") {
                bindArgs += params.values[colName];
            } else if (type == "boolean") {
                bindArgs += params.values[colName] ? 1 : 0;
            } else if (type == "string") {
                bindArgs += "'" + params.values[colName] + "'";
            } else if (params.values[colName] == null) {
                bindArgs += "NULL";
            } else {
                throw "err params type: values";
            }
            i++;
        }
        sql += ") VALUES (" + bindArgs + ");";
        Mix.db.execute({ databaseName: params.databaseName, sql: sql, callback: params.callback });
    }

    /**
     * 删除表数据操作
     * @param databaseName  数据库名
     * @param tableName     表名
     * @param where         条件
     * @param callback      回调
     * databaseName, tableName, where, callback
     */
    function mixDbDelete(params) {
        var defaults = {
            databaseName: 'base',
            tableName: null,
            where: null,
            callback: null,
        }
        extend(defaults, params);
        if (params.tableName == null) {
            throw "no params tableName";
        }
        var sql = "DELETE FROM " + params.tableName;
        if (typeof(params.where) == "string") {
            sql += " WHERE " + params.where;
        } else if (params.where != null) {
            throw "err params type where: values";
        }
        Mix.db.execute({ databaseName: params.databaseName, sql: sql, callback: params.callback });
    }

    /**
     * 更新数据操作
     * @param databaseName  数据库名
     * @param tableName     表名
     * @param values        更新的值：{a:1,b:"test",c:true}
     * @param where         更新的条件
     * @param callback      回调
     * databaseName, tableName, values, where, callback
     */
    function mixDbUpdate(params) {
        var defaults = {
            databaseName: "base",
            tableName: null,
            values: null,
            where: null,
            callback: null,
        }
        extend(defaults, params);
        if (params.tableName == null) {
            throw "no params tableName";
        }
        if (typeof(params.values) != "object") {
            throw "err params type: values";
        }
        if (params.where != null && typeof(params.where) != "string") {
            throw "err params type: where";
        }

        var sql = "UPDATE " + params.tableName + " SET";
        var i = 0;
        for (var colName in params.values) {
            sql += i > 0 ? "," : "";
            var value = params.values[colName];
            if (typeof(value) == "string") {
                value = "'" + value + "'";
            } else if (typeof(value) == "object") {
                throw "err params type: values";
            } else if (value == null) {
                value = "NULL";
            }
            i++;
            sql += "`" + colName + "`=" + value;
        }
        if (params.where) {
            sql += " WHERE " + params.where;
        }
        Mix.db.execute({ databaseName: params.databaseName, sql: sql, callback: params.callback });
    }

    /**
     *查询数据表
     *tableName:表名（string）
     *columns:字段名（jsonarray）eg:["a","b","c"] ,当为null或者[]时表示所有，
     *where:查询条件    为null时表示所有
     *groupBy:分组      为null时表示不分组
     *having:分组条件   为null时表示没有分组条件
     *orderBy：排序条件  为null时表示不排序
     *limit: 分页
     * databaseName, tableName, columns, where, groupBy, having, orderBy, limit, callback
     */
    function mixDbSelect(params) {
        var defaults = {
            databaseName: "base",
            tableName: null,
            columns: null,
            where: null,
            groupBy: null,
            having: null,
            orderBy: null,
            limit: null,
            callback: null,
        }
        extend(defaults, params);
        if (params.tableName == null) {
            throw "no params tableName";
        }
        var sql = "SELECT ";
        var i = 0;
        if (params.columns != null && params.columns.length != 0) {
            for (var x in params.columns) {
                var colName = params.columns[x];
                if (typeof(colName) != "string") {
                    throw "err params type: columns";
                }
                sql += i > 0 ? ", " : " ";
                sql += "`" + colName + "`";
                i++;
            }
        } else {
            sql += "*";
        }
        sql += " FROM " + params.tableName;
        sql += getClause(" WHERE ", params.where);
        sql += getClause(" GROUP BY ", params.groupBy);
        sql += getClause(" HAVING ", params.having);
        sql += getClause(" ORDER BY ", params.orderBy);
        sql += getClause(" LIMIT ", params.limit);
        Mix.db.execute({ databaseName: params.databaseName, sql: sql, callback: params.callback });
    }

    function getClause(name, clause) {
        var c = "";
        if (typeof(clause) != "string" && clause != null) {
            throw "err params type: " + name;
        }
        if (clause != null) {
            c = name + clause;
        }
        return c;
    }

    /**
     * 执行sql语句
     * @param databaseName
     * @param sql
     * @param callback
     * databaseName, sql, callback
     */
    function mixDbExecute(params) {
        var defaults = {
            databaseName: "base",
            sql: null,
            callback: null,
        }
        extend(defaults, params);
        if (params.callback == null) {
            params.callback = function() {};
        }
        Mix.call("executeSQL", { database: params.databaseName, sql: params.sql }, params.callback);
    }

    /**
     * 关闭当前页面
     * @param params  当打开本页面的open方法设置有回调时，此参数会回调到打开本页面的页面回调方法上
     */
    Mix.page.close = function(params) {
        if (Mix.info.isAPP) {
            Mix.call("close", params);
        } else {
            history.back();
        }
    };
    /**
     * 打开二级页面
     * @param url           二级页面的地址
     * @param params        传递给二级页面的参数  eg:{equipment_id:"2017080714112301", name:"锅炉-001", extra:{a:"a", b:123}}
     * @param title         二级页面的标题,不需要时传递为null
     * @param landscape     是否横屏展示
     * @param callback      二级页面关闭时的回调
     * url, params, title, landscape, callback
     */
    Mix.page.open = function(params) {
        var defaults = {
            url: null,
            params: null,
            title: null,
            landscape: false,
            callback: null,
        }
        extend(defaults, params);
        var _params = {};
        if (params.params && typeof(params.params) == "object") {
            if (location.search.length == 0) {
                params.url += "?mix_params=" + encodeURIComponent(JSON.stringify(params.params));
            } else {
                params.url += "&mix_params=" + encodeURIComponent(JSON.stringify(params.params));
            }
        }
        _params.url = params.url;
        if (Mix.info.isAPP) {
            _params.id = "";
            _params.callback = "";
            if (typeof params.title == "string") {
                _params.title = params.title;
            }
            if (typeof params.landscape == "boolean") {
                _params.landscape = params.landscape;
            }
            Mix.call("open", _params, params.callback);
        } else {
            if (_params.url.indexOf("http") == 0) {
                location.href = _params.url;
            } else {
                if (Mix.info.fidisPath.charAt(Mix.info.fidisPath.length - 1) == "/") {
                    top.location.href = Mix.info.fidisPath + _params.url;
                } else {
                    top.location.href = Mix.info.fidisPath + "/" + _params.url;
                }
            }
        }
    };
    /**
     * 获取当前页面的参数 eg:get("equipment_id");
     * @param name  参数名 为null时表示open时传入的第二个参数
     * name
     */
    Mix.page.get = function(params) {
            var defaults = {
                name: null,
            }
            extend(defaults, params);
            var reg = new RegExp("(^|&)mix_params=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            var _params;
            if (r != null) {
                _params = JSON.parse(decodeURIComponent(r[2]));
            } else {
                return null;
            }
            if (params.name != null) {
                return _params[params.name];
            } else {
                return _params;
            }
        }
        /**
         * 刷新当前页面
         */
    Mix.page.refresh = function() {
        location.reload()
    };
    /**
     * 退出登录
     */
    Mix.app.logout = function() {
        if (Mix.info.isAPP) {
            Mix.call("logout");
        } else {
            alert("退出登陆！")
        }
    };
    /**
     * 关闭app
     */
    Mix.app.exit = function() {
        if (Mix.info.isAPP) {
            Mix.call("exit");
        } else {
            window.close();
        }
    };
    /**
     * 打开系统设置界面
     */
    Mix.app.openSetting = function() {
        if (Mix.info.isAPP) {
            Mix.call("openSetting");
        } else {
            alert("打开设置界面");
        }
    };
    //{"right":[{"icon":"&#xf241;","text":"关闭","callback":"close"},{"text":"刷新","callback":"refresh"}...],"title":"标题"}
    Mix.TitleBar = function() {
        this.__title = {};

        /**
         * 隐藏当前标题栏
         * @param hidden
         * hidden
         */
        this.hidden = function(params) {
                var defaults = {
                    hidden: false,
                }
                extend(defaults, params);
                if (params.hidden) {
                    Mix.call("setTitle", {}, null);
                } else {
                    Mix.call("setTitle", this.__title, null);
                }
            }
            /**
             * 设置标题
             * @param title
             * title
             */
        this.setTitle = function(params) {
                var defaults = {
                    title: null,
                }
                extend(defaults, params);
                Mix.call("setTitle", { title: params.title }, null);
                this.__title.title = params.title;
            }
            /**
             * 设置左侧标题
             * @param left eg:{id:11, icon:"&x3432", text:"返回"}
             * @param callBack 参数为left对象
             * left, callback
             */
        this.setLeft = function(params) {
                var defaults = {
                    left: null,
                    callback: null,
                }
                extend(defaults, params);
                //left.callback = callback;
                // this.__titleLeftCallBack = callBack;
                Mix.__callback[++Mix.__callbackCount] = "(" + params.callback.toString() + ")(" + JSON.stringify(params.left) + ")";
                params.left.callback = Mix.__frameTree;
                params.left.id = Mix.__callbackCount;
                Mix.call("setTitle", { left: [params.left] });
                this.__title.left = [params.left];
            }
            /**
             * 设置左侧菜单
             * @param lefts eg:[{id:1, icon:"&x322;", text:"菜单1"},{id:2, icon:"&x322;", text:"菜单2"}]
             * @param callBack 回调函数 参数为点击的left对象
             * lefts, callback
             */
        this.setLefts = function(params) {
                var defaults = {
                    lefts: null,
                    callback: null
                }
                extend(defaults, params);
                for (var index in params.lefts) {
                    var obj = params.lefts[index];
                    Mix.__callback[++Mix.__callbackCount] = "(" + params.callback.toString() + ")(" + JSON.stringify(obj) + ")";
                    obj.callback = Mix.__frameTree;
                    obj.id = Mix.__callbackCount;
                }
                Mix.call("setTitle", { left: params.lefts });
                this.__title.left = params.lefts;
            }
            /**
             * 设置左侧返回按钮回调事件监听
             * @param callback  回调方法 参数为空
             * callback
             */
        this.setBackListener = function(params) {
                var defaults = {
                    callback: null,
                }
                extend(defaults, params);
                Mix.__callback[++Mix.__callbackCount] = params.callback;
                Mix.call("setTitle", { left: [{ callback: Mix.__frameTree, id: Mix.__callbackCount }] });
                this.__title.left = [{ callback: Mix.__frameTree, id: Mix.__callbackCount }];
            }
            /**
             * 设置右侧标题
             * @param right eg:{id:11, icon:"&x3432", text:"分享"}
             * @param callback right对象
             * right, callback
             */
        this.setRight = function(params) {
                var defaults = {
                    right: null,
                    callback: null,
                }
                extend(defaults, params);
                Mix.__callback[++Mix.__callbackCount] = "(" + params.callback.toString() + ")(" + JSON.stringify(params.right) + ")";
                params.right.callback = Mix.__frameTree;
                params.right.id = Mix.__callbackCount;
                Mix.call("setTitle", { right: [params.right] });
                this.__title.right = [params.right];
            }
            /**
             * 设置右侧菜单
             * @param rights eg:[{id:1, icon:"&x3432", text:"分享"},{id:1, icon:"&x3432", text:"关闭"}]
             * @param callback 回调函数： 点击的right对象
             * rights, callback
             */
        this.setRights = function(params) {
                var defaults = {
                    rights: null,
                    callback: null,
                }
                extend(defaults, params);
                for (var index in params.rights) {
                    var obj = params.rights[index];
                    Mix.__callback[++Mix.__callbackCount] = "(" + params.callback.toString() + ")(" + JSON.stringify(obj) + ")";
                    obj.callback = Mix.__frameTree;
                    obj.id = Mix.__callbackCount;
                }
                Mix.call("setTitle", { right: params.rights });
                this.__title.right = params.rights;
            }
            /**
             * 设置多级标题项
             * @param titleMore eg:[{id:1, text:"标题1"}，{id:2, text:"标题2"}]
             * @param callback 回调函数：点击的标题对象
             * titleMore, callback
             */
        this.setTitleMore = function(params) {
            var defaults = {
                titleMore: null,
                callback: null,
            }
            extend(defaults, params);
            for (var index in params.titleMore) {
                var obj = params.titleMore[index];
                Mix.__callback[++Mix.__callbackCount] = "(" + params.callback.toString() + ")(" + JSON.stringify(obj) + ")";
                obj.callback = Mix.__frameTree;
                obj.id = Mix.__callbackCount;
            }
            Mix.call("setTitle", { title_more: params.titleMore });
            this.__title.title_more = params.titleMore;
        }
    };
    /**
     * 调用系统日历
     */
    Mix.app.openCalendar = function() {
        if (Mix.info.isAPP) {
            Mix.call("openCalendar");
        } else {
            console.log("打开日历")
        }
    };
    /**
     * 调用二维码扫描
     * @param title 标题栏
     * @param callback  回调函数 :对象{code:xxxxxxxxx}
     * title, callback
     */
    Mix.app.openQRCode = function(params) {
        if (Mix.info.isAPP) {
            var defaults = {
                title: null,
                callback: null,
            }
            extend(defaults, params);
            Mix.call("openQRCode", { title: params.title }, params.callback);
        } else {
            if (params.callback) {
                params.callback({ code: "test123456789" });
            }
        }
    };
    /**
     * mqtt请求
     * @param params 请求参数
     * @param timeout 超时时间
     * @param callback 回调函数：对象{code:200, body:NetDataObject};
     * params, callback, timeout
     */
    Mix.net.mqtt = function(params) {
        if (Mix.info.isAPP) {
            var defaults = {
                params: null,
                callback: null,
                timeout: null
            }
            extend(defaults, params);
            Mix.call("publish", { params: params.params, timeout: params.timeout }, params.callback);
        } else {
            console.error("浏览器无法发送mqtt请求");
        }
    };
    /**
     * ajax请求
     * @param url       请求地址
     * @param params    请求参数
     * @param method    请求方式：GET|POST
     * @param header    请求头
     * @param index     请求索引值
     * @param callback  回调函数
     * @param timeout   超时时间
     * url, params, callback, timeout
     */
    Mix.__xmlHttp = new Array();
    Mix.net.ajax = function(params) {
        var defaults = {
            index: 0,
            url: null,
            params: null,
            method: "GET",
            header: null,
            callback: null,
            timeout: 10,
        };
        extend(defaults, params);
        var i = params.index;
        if (Mix.__xmlHttp[i] == null) {
            if (window.XMLHttpRequest) { //Mozilla 浏览器
                Mix.__xmlHttp[i] = new XMLHttpRequest();
            } else if (window.ActiveXObject) { //IE浏览器
                //IE浏览器（将XMLHttpRequest对象作为ActiveX对象来创建）
                try {
                    Mix.__xmlHttp[i] = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    try {
                        Mix.__xmlHttp[i] = new ActiveXObject("Microsoft.XMLHTTP");
                    } catch (e) {}
                }
            }
        }
        if (Mix.__xmlHttp[i] == null) {
            console.error("此浏览器不支持AJAX请求！！！");
            return;
        }
        if (params.url == null) {
            console.error("Mix.net.ajax: url不能为空！");
            return;
        }
        if (!params.callback) {
            console.error("Mix.net.ajax: callback不能为空！");
            return;
        }
        var url;
        if (params.url.indexOf("http") == 0) {
            url = params.url;
        } else {
            if (Mix.info.fidisPath.charAt(Mix.info.fidisPath.length - 1) == "/") {
                url = Mix.info.fidisPath + params.url;
            } else {
                url = Mix.info.fidisPath + "/" + params.url;
            }
        }
        //console.log("请求url:" + url);
        //设置一个事件处理器，当XMLHttp状态发生变化，就会出发该事件处理器，由他调用
        //callback指定的javascript函数
        Mix.__xmlHttp[i].onreadystatechange = function() {
            try {
                if (Mix.__xmlHttp[i] == null) {
                    params.callback({
                        "code": "500",
                        "body": {}
                    });
                } else if (Mix.__xmlHttp[i].readyState == 4) {
                    if (Mix.__xmlHttp[i].status == 200) {    	
                        if (Mix.__xmlHttp[i].responseText != null && Mix.__xmlHttp[i].responseText != "") {
                            //处理数据
                            //console.log("响应数据:" + url + "\n" + Mix.__xmlHttp[i].responseText);
                            params.callback({
                                "code": "200",
                                "body": Mix.__xmlHttp[i].responseText
                            });
                        }
                    } else {
                        params.callback({
                            "code": "400",
                            "body": {}
                        });
                    }
                }
            } catch (e) {
                //alert(e);
                //fun({"code":"500","body":{}});
                console.log("请求出错",e);
            }
        };
        //参数处理
        var param=function(params,flag){
            var p=[];
            for(var key in params){
                if(typeof(params[key])=='object'){
                    p=p.concat(param(params[key],key));
                }else{
                    p.push((flag?flag+'['+key+']':key)+'='+params[key]);
                }
            }
            return p;
        }
        var p=param(params.params).join('&');
        if (params.method == "GET") {
            url +='&'+p;
        }      
        //设置对拂去其调用的参数（提交的方式，请求的的url，请求的类型（异步请求））
        Mix.__xmlHttp[i].open(params.method, url, true); //true表示发出一个异步的请求。        
        Mix.__xmlHttp[i].setRequestHeader('Content-type','application/x-www-form-urlencoded');
        Mix.__xmlHttp[i].send(p);
    };
    /**
     * 原生框架http请求
     * @param url   请求地址
     * @param params    请求参数
     * @param method   请求方式：GET|POST
     * @param header   请求头
     * @param callback  回调函数
     * @param timeout   超时时间
     * url, params, method, header, callback, timeout
     */
    Mix.net.http = function(params) {
        var defaults = {
            url: "",
            params: null,
            method: "GET",
            header: null,
            callback: null,
            timeout: 10,
        }
        extend(defaults, params);
        if (Mix.info.isAPP) {
            Mix.call("httpRequest", params, params.callback);
        } else {
            Mix.net.ajax(params);
        }
    };
        // Mix.net.http = function (params){
        // var defaults = {
        // url: null,
        // params: null,
        // method: "GET",
        // callback: null,
        // timeout: null,
        // }
        // extend(defaults, params);
        // Mix.call("publish", {params:params.params, timeout:params.timeout}, params.callback);
        // };
        /**
         * 位置监听
         * @param loop  是否循环监听
         * @param interval  上报间隔（只针对于Android 有效）
         * @param callback  回调
         * loop, interval, callback
         */
    Mix.app.location = function(params) {
        var defaults = {
            loop: false,
            interval: 10,
            callback: null,
        }
        extend(defaults, params);
        if (Mix.info.isAPP) {
            if (params.interval && parseInt(params.interval) == params.interval) {
                if (params.interval <= 0) {
                    params.interval = 1;
                }
            }
            Mix.call("getLocation", { loop: params.loop, interval: params.interval }, params.callback);
        } else {
            if (navigator.geolocation) {
                if (params.loop) {
                    setInterval(function() {
                        navigator.geolocation.getCurrentPosition(params.callback);
                    }, params.interval * 1000);
                } else {
                    navigator.geolocation.getCurrentPosition(params.callback);
                }
            } else {
                console.error("此浏览器不支持定位！");
            }
        }
    };
    /**
     * 设置mqtt消息回调
     * @param callback  回调方法: string
     * callback
     */
    Mix.app.setMsgListener = function(params) {
        var defaults = {
            callback: null,
        }
        extend(defaults, params);
        if (Mix.info.isAPP) {
            var _params = {};
            Mix.__callback[++Mix.__callbackCount] = params.callback;
            _params.callback = Mix.__frameTree;
            _params.id = Mix.__callbackCount;
            Mix.call("setListener", _params);
        } else {
            Mix.debug.__testMsgCallbackId = ++Mix.__callbackCount;
            Mix.__callback[Mix.debug.__testMsgCallbackId] = params.callback;
            console.log("设置消息监听成功，如需模拟消息则在控制台中输入以下代码：\n" +
                "******************************\n" +
                Mix.__frameTree + ".postMessage({id:" + Mix.debug.__testMsgCallbackId + ", body:{\"MsgId\":\"46de435d12a12c1\",\"MsgType\":\"APP\",\"From\":\"fangkuai\",\"To\":\"app\",\"Time\":\"1505977944\",\"Data\":{\"type\":\"warning\",\"title\":\"探针极低水位报警-A160310-03\"}}}, \"*\");\n" +
                "******************************"
            );
        }
    };
    /**
     * 设置安卓返回按钮回调，当设置此回调之后安卓物理按键的返回键将失效
     * @param callback
     * callback
     */
    Mix.app.setBackListener = function(params) {
        var defaults = {
            callback: null,
        }
        extend(defaults, params);
        if (Mix.info.isAPP) {
            var _params = {};
            Mix.__callback[++Mix.__callbackCount] = params.callback;
            _params.callback = Mix.__frameTree;
            _params.id = Mix.__callbackCount;
            Mix.call("setBackListener", _params);
        } else {
            Mix.debug.__testBackListenerId = ++Mix.__callbackCount;
            Mix.__callback[Mix.debug.__testBackListenerId] = params.callback;
            console.log("设置Android 返回按钮监听成功，如需模拟消息则在控制台中输入以下代码：\n" +
                "**************************************\n" +
                Mix.__frameTree + ".postMessage({id:" + Mix.debug.__testBackListenerId + ", body:{}}, \"*\");\n" +
                "**************************************"
            );
        }
    };
    /**
     * 设置推送点击事件回调监听，此方法需在主界面中进行调用
     * @param callback
     * callback
     */
    Mix.app.setPushListener = function(params) {
        if (Mix.info.isAPP) {
            var defaults = {
                callback: null,
            }
            extend(defaults, params);
            var _params = {};
            Mix.__callback[++Mix.__callbackCount] = params.callback;
            _params.callback = Mix.__frameTree;
            _params.id = Mix.__callbackCount;
            Mix.call("setPushListener", _params);
        }
    };
    /**
     * 打开设置WiFi界面
     */
    Mix.app.openSetWifi = function() {
        if (Mix.info.isAPP) {
            Mix.call("openSetDeviceWifi");
        } else {
            alert("打开设置WiFi界面");
        }
    };
    /**
     * APP响铃和震动
     * @param voice 是否有声音
     * @param shake 是否震动
     * voice, shake
     */
    Mix.app.remind = function(params) {
        var defaults = {
            voice: false,
            shake: false,
        }
        extend(defaults, params);
        if (Mix.info.isAPP) {
            if (Mix.info.isIOS) {
                Mix.call("remind2", params);
            } else {
                Mix.call("remind", params);
            }
        } else {
            if (params.voice) {
                console.log("--------------响铃------------");
            }
            if (params.shake) {
                console.log("--------------震动------------")
            }
        }
    };
    /**
     * 打开轨迹跟踪界面
     */
    Mix.app.openTracking = function() {
        if (Mix.info.isAPP) {
            Mix.call("openTracking");
        } else {
            console.log("打开轨迹跟踪界面");
        }
    };
    /**
     * 打开sip拨号模块
     */
    Mix.app.openCall = function() {
        if (Mix.info.isAPP) {
            Mix.call("openCall");
        } else {
            alert("打开sip拨号界面");
        }
    };
    /**
     * 打开im模块
     */
    Mix.app.openIm = function() {
        if (Mix.info.isAPP) {
            Mix.call("openIM");
        } else {
            alert("打开IM模块");
        }
    };

    /**
     *  name:"yutoo"
     *  phone:"15708324246"
     *  second_phone:"13113044228"
     *  third_phone:"10086"
     *  email:"yutong@mixlinker.com"
     *  address:"大学城"
     *  company:"智物联"
     *  job:"Android开发工程师"
     *  added in 30018
     */
    Mix.app.addContact = function(params) {
        if (Mix.info.isAPP) {
            Mix.call("addContact", params);
        } else {
            alert("添加联系人到通讯录");
        }
    }

    /**
     *  params:"你好，阳光！"
     */
    Mix.app.copyToClipboard = function(params) {
        if (Mix.info.isAPP) {
            if (Mix.info.isIOS) {
                var _params = { str: params };
                Mix.call("copyToClipboard", _params);
            } else {
                Mix.call("copyToClipboard", params);
            }
        } else {
            alert("复制字符串到粘贴板");
        }
    }

    /**
     * 打开选择器
     * @param type json数组   取值为：camera / image  / file
     * @param callback {files:[fileObj, fileObj, fileObj]}
     * added in 30018
     */
    Mix.app.openChooser = function(params) {
        if (params && params.type && params.callback) {
            if (!params.count) {
                params.count = 1;
            }
            if (Mix.info.isAPP) {
                Mix.call("openChooser", { choose_type: params.type, count: params.count }, params.callback);
            } else {
                //TODO 打开文件选择器
            }
        } else {
            console.error("openChooser: 参数错误!必须包含type和callback");
        }
    }

    /**
     * formSubmit
     * files:[{name:"file", file:fileObject},{name:"file", file:fileObject}]
     * params:{"name":"zhangsan", "age":"12"}
     * url:http://www.baidu.com/a=upload
     * onProgress:进度回调{total:4543234, progress:0.3}
     * onComplete:完成回调{code:200, body:"xxxxxxxxxxxxxxx"}
     * added in 30018
     */
    Mix.app.submit = function(params) {
        if (!params.url) {
            console.log("缺少参数url");
            return;
        }
        if (params.onProgress) {
            Mix.__callback[++Mix.__callbackCount] = params.onProgress;
            delete params.onProgress;
            params.progress = { callback: Mix.__frameTree, id: Mix.__callbackCount };
        }
        if (params.onComplete) {
            var id = new Date().getTime() + "_" + ++Mix.__callbackCount;
            Mix.__callback[id] = params.onComplete;
            delete params.onComplete;
            params.complete = { callback: Mix.__frameTree, id: id };
        }
        if (Mix.info.isAPP) {
            Mix.call("formSubmit", params);
        } else {
            //TODO 表单提交
        }
    }
})();