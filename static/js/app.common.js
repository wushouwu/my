var jq=jQuery.noConflict();
//全局方法
window.c={
	//输入框测试代码  调用方法：eval(TEST);
	TEST:"\
		function prompt_test(argument){\
			if(typeof prompt_value=='undefined'){\
				prompt_value='console.log(argument)';\
			}\
			prompt_value=prompt('输入要执行的代码',prompt_value);\
			if(prompt_value){\
				eval('('+prompt_value+')');\
				prompt_test(argument);\
			}\
		}\
		prompt_test(arguments);\
	",
	//获取url参数值
	param_get:function (name){
	     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	     var r = window.location.search.substr(1).match(reg);
	     return r?decodeURIComponent(r[2]):'';
	},
	//单位与位数处理
	unit_asc: function(tpl,num){
	    value=Number(tpl.value);
	    if(isNaN(value)){
	        return tpl;
	    }
		if('unit_asc' in tpl){
			var unit_asc=tpl.unit_asc;
			var num =num || 7
			len=String(Math.round(value)).length;
			if(len>num){
				multiple=Math.ceil((len-num)/3);
				deal=value/Math.pow(10,3*multiple)
				deal_len=parseInt().length;
				tpl.value=Number(deal.toFixed(num-deal_len));
			}else{
				multiple=0;
				var temp=Number(value.toFixed(num-len));
				tpl.value=temp.length>String(value).length?value:temp;
			}

			if(multiple in unit_asc){
				tpl.unit=unit_asc[multiple];
			}else{
				tpl.unit='数据溢出未配置';
			}
		}else{
			tpl.value=(value%1) == 0?value:Number(value.toFixed(2));
		}	
		return tpl;
	},
	//date:时间格式字符串yyyy-mm-dd hh:ii:ss或yyyy-mm-dd
	//days:加减天数 减1为 -1
	//按传入时间格式返回yyyy-mm-dd hh:ii:ss或yyyy-mm-dd
	date_to: function(date,days){
	    var d= new Date()
	    d.setTime(Date.parse(date)+3600*1000*24*days);
	    date=date.split(' ');
	    return d.Format(date[1]?'Y-m-d H:i:s':'Y-m-d');
	},
	//页面回调传参
	page_back: function(json){
        var titleBar = new Mix.TitleBar();
        titleBar.setBackListener({ callback:function (){ 
            Mix.page.close(json);
        }})
        Mix.app.setBackListener({callback:function(){
            Mix.page.close(json);
        }});
	},	
	//websocket 连接方法
    openSocket: function(data){
       	var ws='ws://'+location.href.split('/')[2].split(':')[0]+':7379';
        if('ws' in data && data.ws){
            ws=data.ws;
        }else{		
            if(typeof(Mix.info.fidisPath)!='undefined'){
                ws='ws://'+Mix.info.fidisPath.split('/')[2].split(':')[0]+':7379'
            }
        }		
        var socket = new WebSocket(c.ws);
        socket.onerror = function (event) {
            console.log("WebSocket连接失败!", event);
        };
        socket.onclose = function (event){
            console.log("WebSocket连接失败!", event);
            openSocket(data)
        };
        socket.onopen = function (event) {
            console.log("WebSocket连接成功!");
            var sub=['PSUBSCRIBE'];
            sub=sub.concat(sub,data.sub);
            socket.send(JSON.stringify(sub));
        };
        socket.onmessage = function (event) {
        	if('debug' in data && data.debug){
        		console.log("message:" + event.data);	
        	}
            var msg = JSON.parse(event.data);
            var psubscribe=msg.PSUBSCRIBE;
            if(3 in psubscribe){
                var channel = psubscribe[2].split(".");
                var identify=channel[0];
                var type=channel[1];
                var key=2 in channel ?channel[2]:'';
                var payload=JSON.parse(psubscribe[3]).payload
                var value=key in payload?payload[key]:'';
                if(typeof(data.callback)=='function'){
                	data.callback(identify, type, key, value, payload);
                }
            }
        }
    },	
	/*
		测试方法运行效率
		option.cycle_time:测试循环次数
		option.param:需要传入的参数
		option.fun:测试的方法名
		option.run: 作为fun 参数返回运行信息
		option.show 结果返回方式
	*/
	Effect:function(option){
		option=jq.extend({
			show: 'alert',
			cycle_time:100,
			param: {},
			fun: function(opt){
				console.log(opt.run);
			}
		},option);
		var d1=new Date().getTime();
		for(i=1;i<=option.cycle_time;i++){
			if(typeof(option.fun)=='function'){
				var d2=new Date().getTime();
				option.run={
					n:i,
					firstTime: d1,
					n_1Time: d2,
					nPeriod: d2-d1
				};
				option.fun(option);
			}
		}
		var fun_name=option.fun.toString().split('{')[0];
		var output=fun_name+' 运行时间:'+(new Date().getTime()-d1)+'毫秒'
		if(option.show=='alert'){
			alert(output);
		}else if(option.show=='console'){
			console.log(output);
		}else{
			return output;
		}
	}		
};
//mui pullrefresh
jq(function(){
	if(jq('.mui-scroll-wrapper').length && mui && typeof(page)!='undefined' && page.pullRefresh){
		page.pullRefresh.callback=function(){
			var pullrefresh=this,
				option=page.pullRefresh;
			if(pullrefresh.pulldown){
				option.data.start=0;
			}
			option.data=jq.extend({start:0,limit:10},option.data);
			jq.myAjax({
				url: option.url,
				data: option.data, 
				done: function (data,body,response){
					if(pullrefresh.pulldown){
						if(option.container.length){
							option.container.empty();
						}
					}
					option.done(data,body,response,page);
					option.data.start += option.data.limit;
					if(pullrefresh.pulldown){
						pullrefresh.endPulldownToRefresh();
						pullrefresh.refresh(true);
					}else{
						pullrefresh.endPullupToRefresh(data.length< option.data.limit);				
					}
				}
			});
		}		
		mui.init({
			pullRefresh: {
				container: '.mui-scroll-wrapper',
				down: {
					callback: page.pullRefresh.callback
				},
				up: {
					auto: true,
					contentrefresh: '正在加载...',
					callback: page.pullRefresh.callback
				}
			}
		});
	}
});
//时间格式化方法
Date.prototype.Format = function (fmt) { //author: meizz 
    var handle =function(value){
           return value<10?'0'+value:value;
    }      
    var o = {
        "m+": handle(this.getMonth() + 1), //月份 
        "M+": this.getMonth() + 1, //月份 
        "d+": handle(this.getDate()), //日 
        "H+": handle(this.getHours()), //小时 
        "i+": handle(this.getMinutes()), //分 
        "s+": handle(this.getSeconds()), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds(), //毫秒 
        "Y": (this.getFullYear() + ""),
        "y": (this.getFullYear() + "").substr(2,2),
        "yyyy":(this.getFullYear() + "")
    };
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
//jq方法
jq.extend(jq.fn,{
	picker:function(data){
	    var defaults={
	        show_index:0,
	        value:'',
	        option:[]
	    }
	    data=jq.extend(defaults,data);
	    jq(this).val(data.value in data.option?data.option[data.value].text:data.value);
	    jq(this)[0].addEventListener('tap',function(){
	        var me=this;
	        var mui_picker=new mui.PopPicker();
	        mui_picker.setData(data.option);
	        mui_picker.pickers[0].setSelectedIndex(data.show_index);
	        mui_picker.show(function(item){
	        	if('text' in item[0]){
		            me.value=item[0].text;
		            jq(me).attr('val',item[0].value);
		        }else{
		        	me.value=item[0];
		        }
	        })
	    });
	    return jq(this);
	}
});
//处理mui 问题
window.addEventListener('touchmove', function(e) {
    var target = e.target;
    if (target && target.tagName === 'TEXTAREA') {//textarea阻止冒泡
        e.stopPropagation();
    }
}, true);