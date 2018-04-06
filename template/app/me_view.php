<!DOCTYPE html>
<html>
<head>
<?php
    dir::include_tpl('head');
?>
<script src="static/jquery-ui/jquery-ui.js"></script>
<script src="static/jquery-ui/jquery.ui.touch-punch.min.js"></script>
<link rel="stylesheet" href="static/jquery-ui/jquery-ui.css">
<link rel="stylesheet" href="static/font-awesome/css/font-awesome.min.css">
<style type="text/css">
html,body{
	height: 100%;
}
/*  自适应原则
	元素字体以根元素html为参考，即以rem为单位，所有根元素html字体须统一设置为1px;
	整体为自动高度时,元素高度以元素字体高度为参考，即以em为单位			
	整体高度为100%时，元素高度以父元素为参考，即以%为单位
	元素高度必要情况下可考虑以文档宽度为参考，即以vw为单位
	容器元素宽度始终以%为单位,组件元素可考虑使用px为单位
	尽量少使用flex等兼容性差的布局方式，如需使用用，须做兼容处理
*/
.my-ul{
    margin-top: 0;
    margin-bottom: 0;
    padding-left: 0;
    list-style: none;
	background: #efeff4;
}
.my-li{
	font-size: 17rem;
	margin-bottom: 0.6em;
	background: white;
}
.my-ul>.my-content{
}
.my-li>.my-title{
	font-size: 15rem;
	height: 3em;
	line-height: 3em;
	padding-left: 3.5%;
	color: #333333;
	font-weight: 600;
	position: relative;
}
.my-li>.my-title::after{
    content: '';
    background: #e6e6e6;
    bottom: 0px;
    position: absolute;
    height: 1px;
    left: 4%;
    right: 4%;
}
.my-ul .my-name-value{
	font-size: 12rem;
	line-height: 2.4em;
	padding-left: 3.5%;
	color: #666666;
}
.my-ul .my-value{
    margin-left: 2%;
}
.my-ul .my-name-value-sub{
	color: #999999;
}
</style>
</head>
<body>
<div class="mui-scroll-wrapper">
    <div class="mui-scroll">
		<ul id="list" class="my-ul" style="background:#efeff4"></ul>
    </div>
</div>
</body>
<script type="text/javascript">
var page={
    init: function(page){
		jq('body').edit({
			tap: function(){
				Mix.page.open({
					url: '<?php dir::route('?a=me_edit');?>'
				});
			}
		});
    },
    pullRefresh: {
		container: jq('#list'),
		url: '?m=memory&c=me&a=table',
		data: {
			table: c.param_get('table'),
			sort: 'datetime'
		},	
		done: function (data,body,response,page){
			for(var key in data){
				var d = data[key];
				d.word=d.word.split(',');
				for(var k in d.word){
					d.word[k]='<span class="mui-badge mui-badge-primary">'+d.word[k]+'</span>';
				}
				jq(
					'<li class="my-li">\
						<div class="my-title"><div>'+d.attribute+'</div></div>\
						<div class="my-content">\
							<div class="my-name-value"><span class="my-name">标签：</span><span class="my-value">'+d.word.join('')+'</span></div>\
							<div class="my-name-value"><span  class="my-name">值：</span><span class="my-value">'+d.value+'</span></div>\
							<div class="my-name-value my-name-value-sub"><span class="my-name">时间:</span><span class="my-value">'+d.datetime+'</span></div>\
						</div>\
					</li>'
				).appendTo(page.pullRefresh.container)
				.data('data',d)
				.get(0).addEventListener('tap',function(){
					var d=jq(this).data('data');
					Mix.page.open({
						url: '<?php dir::route("?a=me_edit");?>id='+d.id,
						title: '个人档案详情'
					});
				});
			}
		}
    }
};
page.init(page);
</script>
</html>