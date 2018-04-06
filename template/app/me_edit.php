<!DOCTYPE html>
<html>
<head>
<?php
    dir::include_tpl('head');
?>
<link href="static/mui/css/mui.picker.min.css" rel="stylesheet" />
<script src="static/mui/js/mui.picker.min.js"></script>
<style type="text/css">
html,body{
	height:100%;
}
.my-fieldset .my-title{
	color: #6d6d72;
	font-size: 15rem;
	line-height: 2.66em;
	padding-left: 4%;
}
.my-fieldset .my-field{
	height: auto;
}
.my-fieldset .my-name{
	width:30%;
	font-size: 15rem;
	line-height: 2.67em;
	padding: 0px 0px 0px 4%;
	white-space:nowrap;
	color: #333333;
}
.my-fieldset .my-required{
	color: red;
}
.my-fieldset .my-required:after{
	content:"·";
}
.my-fieldset .my-name~*:not(textarea){
	font-size: 17rem;
	line-height: 2.35em;
	padding: 0px;
}
.my-fieldset textarea,.my-fieldset .my-name~textarea{
    font-size: 15rem;
    height: 10em;
    border: 1px solid #cccccc;
    margin: 1%;
    border-radius: 3px;
    padding: 1%;
}
.my-fieldset input[readonly]{
    color: #616161;
}
.my-form button{
	width: 89%;
	padding: 7px 0;
	margin: 10px auto;
}
</style>
</head>
<body onresize="document.activeElement.scrollIntoView(false);">
<div class="mui-content mui-scroll-wrapper" style="overflow-y:auto">
    <div class="mui-scroll">
    	<div id="list" class="my-form">
			<div class="my-fieldset">
				<div class="my-title">信息录入</div>
				<div class="mui-input-group" id="info">
				</div> 
			<div>
            <button type="button" class="mui-btn mui-btn-primary mui-btn-block">确定</button>
    	</div>
    </div>
</div>
</body>
<script type="text/javascript">
//表单字段处理
jq.fn.myField=function(field){
	var $group=this,
		html='';
	field=jq.extend({
		field: '',
		value: '',
		name: '',
		type: 'varchar',
		readonly: false,
		required:　false,
		placeholder: ''
	},field);
	switch(field.type){
		case 'varchar': 
			html='<input name="'+field.field+'"  type="text" value="'+field.value+'" />';
		break;
		case 'text':
			html='<textarea name="'+field.field+'">'+field.value+'</textarea>';
		break;  
		case 'datetime':
			field.value=field.value.split(' ').join('T');
			html='<input name="'+field.field+'"  type="datetime-local" value="'+field.value+'" />';
		break;
		default: 
			html='<input name="'+field.field+'"  type="text" value="'+field.value+'" />';
	}	
	$field=jq(
		'<div class="mui-input-row my-field">\
			<label  class="my-name"><span>'+field.name+'</span></label>\
			'+html+'\
		</div>'                        
	).appendTo($group)
	.data('data',field)
	.children().last()
		.attr('readonly',function(){
			var field=jq(this).parent().data('data');
			jq(this).attr('required',eval(field.required));
			if(eval(field.required)){
				jq(this).siblings('.my-name').append('<span class="my-required"></span>');
			}
			jq(this).attr('placeholder',field.placeholder);
			if(field.type=='hidden'){
				jq(this).parent().css({display:'none'});
			}			
			return field.readonly;
		});
}
var page={
    id: c.param_get('id'),
    init: function(page){
		//字段信息请求
    	jq.myAjax({
    		url: '?m=memory&c=me&a=fields',
    		data: {
    		    table: 'me'
    		},
    		done: function (data,body,response) {
				if(page.id){
					jq.myAjax({
						url: '?m=memory&c=me&a=table',
						data: {
							table: 'me',
							limit: 1,
							where: '`id`='+page.id
						},
						done: function(d,b,res){
							page.dataHandle(data,body,response,d);
						}
					})
				}else{
					if(data.datetime){
						data.datetime.value=new Date().Format('Y-m-dTH:i:s');
					}
					delete data.id;
					page.dataHandle(data,body,response);
				}
    		}
    	});
    },
	//字段生成处理
	dataHandle: function(fields,body,response,field_value){
		var page=this;
		for(var key in fields){
			var field=fields[key];
			field.value=field_value &&　field_value[field.field]?field_value[field.field]:field.value;
			jq('#info').myField(field);
		}
		jq('button').get(0).addEventListener('tap',function(){
			var data=[];
			for(var key in fields){
				var field=fields[key];
				data[field.field]=jq('[name="'+field.field+'"]').val();
				if(!data[field.field] && eval(field.required)){
					mui.toast(field.name+'不能为空');
					return;
				}
			}
			page.submit(data);
		});		
	},
	//保存提交
    submit: function(data){
    	jq.myAjax({
    		url: '?m=memory&c=me&a=edit',
    		data: {
    		    info: data
    		},
    		type: 'POST',
    		done: function (data,body,response) {
				console.log(data,body,response);
    			Mix.page.close();
    		}
    	}); 
    }
}
page.init(page);
</script>
</html>