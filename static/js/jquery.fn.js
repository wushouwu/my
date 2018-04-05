var allRequireFile={
		layuiJs: 'modules/iot_base/statics/layui/layui.all.js',
		layuiCss: 'modules/iot_base/statics/layui/css/layui.css',
		formCss:'modules/iot_base/statics/css/mix.form.css',
		fnCss:'static/css/jquery.fn.css',
		cardCss: 'modules/iot_base/statics/css/mix.card.css',
		jqueryUiCss: 'static/jquery-ui/jquery-ui.css',
		jqueryUiJs: 'static/jquery-ui/jquery-ui.js',
	},
	jq=jQuery.noConflict(),
	isAPP=navigator.userAgent.match(/Mobile/);
jq.extend({
	//依次加载css/js文件后执行回调
	require: function(files,callback,callWhatever){
		var loadedFiles=[];
		var unloadedFiles=[];
		callback=typeof(callback)=='function'?callback:function(loadedFiles){};
		callWhatever=callWhatever || false;
		var require=this;
		//加载后回调处理		
		var loadedCallback=function(loaded,index,file){
			if(loaded){
				loadedFiles.push(file);
			}else{
				unloadedFiles.push(file);
			}
			index++;
			if(index in files){
				load(index);
			}else{
				if(this.callWhatever){
					callback(loadedFiles,unloadedFiles);
				}else{
					if(!unloadedFiles.length){
						callback(loadedFiles,unloadedFiles);
					}
				}
			}
		};
		//加载文件
		var load=function(index){
			if(index in files){
				var file=files[index];
				var start=file.lastIndexOf('.');
				var ext=file.substr(start+1);
				var eleInfo={
					css : {ele: 'link',linkAttr: 'href',attr: {type:'text/css',href: file,rel:'stylesheet'}},
					js: {ele: 'script',linkAttr: 'src',attr: {type:'text/javascript',src:file}}
				}
				if(ext in eleInfo && !jq(eleInfo[ext].ele+'['+eleInfo[ext].linkAttr+'*="'+file+'"]').length){
					var element = document.createElement(eleInfo[ext].ele);
					jq('head').append(element);
					var loaded=false;
					jq(element).attr(eleInfo[ext].attr).load(function(event){
				    	loadedCallback(true,index,file);	
				    	loaded=true;			    	
				    });			
				    setTimeout(function(){
				    	if(!loaded){
				    		console.log(file+'加载超时');
				    		loadedCallback(false,index,file);
				    	}
				    },3000);
				}else{
					if(!(ext in eleInfo)){
						console.log(file+'未加载,非js/css文件');
						loadedCallback(false,index,file);
					}else{
						//console.log(file+'已加载,未再次加载');
						loadedCallback(true,index,file);
					}
				}
			}else{
				console.log('不存在文件'+index);
			}		
		}
		load(0);
	},
	//提示框
	myMsg: function(option){
		jq.require([
			allRequireFile.fnCss
		],function(loadedFiles,unloadedFiles){
			option=jq.extend({msg:'',second:3000},option);
			$msg=jq(
				'<div class="my-toast-container my-active">\
					<div class="my-toast-message">'+option.msg+'</div>\
				</div>'
			).appendTo('body').fadeOut(option.second);
			setTimeout(function(){
				$msg.remove();
			},option.second);
		});
	},	
	//ajax 封装
	myAjax: function(option){
		if(isAPP){ 
			option=jq.extend({
				url:'',
				data: {},
				index: 0,
				type: 'GET',
				success: function(response){
					var body={res:0,data:[],msg:'请求出错'};
					if(response.code == 200){
						try{
							response.body = JSON.parse(response.body);
						}catch(e){
							console.log(e)
						}
						body=jq.extend(body,response.body);
						if(body.res){	
							if(typeof(option.done)=='function'){
								option.done(body.data,body,response);
							}
						}else{
							jq.myMsg({msg:body.msg});
						}
					}else{
						jq.myMsg({msg:response.msg});
					}
				}
			},option);
			Mix.net.http({
				url: option.url,
				params: option.data, 
				index: option.index,
				method: option.type,
				callback: option.success
			});
		}else{
			jq.ajax(jq.extend({
				url: '',
				data: {},
				dataType: 'json',
				success: function(res){
					if(res.res && 'data' in res){
						if(typeof(option.done)=='function'){
							option.done(res.data);
						}
					}else{
						jq.myMsg({msg:'msg' in res?res.msg:'请求数据错误'});
					}
				},
				timeout: 30000,
				error: function(xhr,type,msg){
					jq.myMsg({msg:('errorMsg' in option ? option.errorMsg: '请求失败')+'<br>错误类型:'+type+'<br>错误信息:'+msg});					
				}
			},option));
		}
	},	
});
jq.fn.extend({
	//多选下拉框
	multiselect: function(options){
		multiselect=this;
		var formSelects = {
			options:{
				values: [],
				options: [],
				layFilter: '',
				left:'【',
				right:'】',
				separator:',',
			},
			$dom: null,
			arr: [],
			on(options){//开启	
				var form = layui.form;
				formSelects.options=jq.extend(formSelects.options,options);
				var $dom=jq(multiselect),
					name=$dom.attr('name'),
					selected='';
				formSelects.options.layFilter=$dom.attr('lay-filter');
				//放入<option>
				if(typeof formSelects.options.values=='string'){
					formSelects.options.values=formSelects.options.values.split(formSelects.options.separator);
				}
				formSelects.options.options.forEach(function(item,index,arr){
					jq('<option value="'+item.value+'">'+item.name+'</option>').appendTo($dom);
				});
				layui.form.render('select',$dom.closest('.layui-form').attr('lay-filter'));
				formSelects.$dom = $dom.removeAttr('name').next();
				formSelects.$input=jq('<input type="hidden" name="'+name+'" value="">').insertAfter(formSelects.$dom);
				formSelects.$dom.find('dl').css('display', 'none');
				//<option>默认值
				if(formSelects.options.options.length){
					var val_str='',
						value_arr=[],
						formSelects_options_options=[];
					for(v in formSelects.options.options){
						var option=formSelects.options.options[v];
						if(formSelects.options.values.indexOf(option.value)>=0){
							val_str+=formSelects.options.left+option.name+formSelects.options.right;
							value_arr.push(option.value);
							formSelects_options_options.push(option);
						}
					}
					formSelects.options.options=formSelects_options_options;
					formSelects.$input.val(value_arr.join(','));
					formSelects.$dom.find('input').attr('value', val_str);
				}
				form.on('select('+formSelects.options.layFilter+')', function(data){
				  	//如果所选有值, 放到数组中
					var include = false;
					for(var i in formSelects.options.options){
						var option=formSelects.options.options[i];
						if(option.value ==data.value){
							formSelects.options.options.splice(i,1);
							include = true;
						}
					}
					if(!include){
						formSelects.options.options.push(formSelects.exchange(data));
					}
				  	//调整渲染的Select显示
				  	formSelects.show();
				  	//取消收缩效果
					formSelects.$dom.find('dl').css('display', 'block');
				});
				
				jq(document).on('click', 'select[lay-filter="'+formSelects.options.layFilter+'"] + div input', (e)=>{
					formSelects.show();
				});
				jq(document).on('click', 'html:not(select[lay-filter="'+formSelects.options.layFilter+'"] + dl)', (e)=>{
					e.stopPropagation();
					var showFlag = jq(e.target).parents('.layui-form-select').prev().attr('lay-filter') == formSelects.options.layFilter;
					var thisFlag = formSelects.$dom.find('dl').css('display') == 'block';
					if(showFlag){//点击的input框
						formSelects.$dom.find('dl').css('display', thisFlag ? 'none' : 'block');
					}else{
						if(thisFlag){
							formSelects.$dom.find('dl').css('display', 'none');
						}
					}
					formSelects.$dom.find('.layui-select-title input').val(formSelects.$dom.find('.layui-select-title input').attr('value'));
				});
			},
			show(){
			  	formSelects.$dom.find('.layui-this').removeClass('layui-this');
			  	var input_val = '';
			  	var value_arr=[];
			  	for(var i in formSelects.options.options){
			  		var option = formSelects.options.options[i];
			  		if(option){
			  			input_val +=  formSelects.options.left+option.name+formSelects.options.right;
						formSelects.$dom.find('dd[lay-value="'+option.value+'"]').addClass('layui-this');	
						value_arr.push(option.value);						  			
			  		}
			  	}
			  	//if(formSelects.options.separator && formSelects.options.separator.length > 0 && input_val.startsWith(formSelects.options.separator)){
			  		//input_val = input_val.substr(formSelects.options.separator.length);
			  	//}
			  	formSelects.$dom.find('.layui-select-title input').val(input_val);
			  	formSelects.$dom.find('.layui-select-title input').attr('value',input_val);
			  	formSelects.$input.val(value_arr.join(','));
			},
			exchange(data){
				if(data.value){
					return {
						name: jq(data.elem).find('option[value='+data.value+']').text(),
						value: data.value
					}
				}
			}
		};	
		formSelects.on(options);
	},
	//下拉选择组件
	select: function(option){
		var $mix_field_value=jq(this),
			field=jq.extend(true,{
				name: '',
				id: 'info',
				field: '',
				type: 'select',
				value: '',
				separator: '',
				option:{ url: ''}
			},option);
		//生成<option>
		jq.fn.optionAppend=function(opt){
			var options=opt.options,
				field=opt.field,
				value=opt.value; 
			jq('<option value="">请选择</option>').appendTo(this);           			
			for(var key in options){
				var option=options[key];
				var selected=value==option.value?'selected':'';
				jq('<option value="'+option.value+'" '+selected+'>'+option.name+'</option>').appendTo(this);
			}
			return this;
		}
		jq.mixAjax(jq.extend({
			field:field,
			errorMsg: field.name+'请求失败',
			success: function(res){
				var field=this.field;
				if('data' in res){
					if('multiselect' in field.option && eval(field.option.multiselect)){
						//多选
						jq('select[lay-filter="select-'+field.field+'"]').multiselect({
							values: field.value,
							options: res.data,
							separator: field.separator?field.separator:','
						});
					}else{
						//联动
						if('linkage' in field){
							field.value=field.value.split(field.separator?field.separator:'-');
							var field_value=field.value[0];
						}else{
							var field_value=field.value;
						}
						//单选
						jq('select[lay-filter="select-'+field.field+'"]').optionAppend({
							options:res.data,
							field: field,
							value:field_value
						});			                			
						layui.form.render('select',field.field);
						if('linkage' in field){
							$select=jq('select[name="'+field.id+'['+field.field+']"]');
							$select.removeAttr('name');
							jq('<input type="hidden" name="'+field.id+'['+field.field+']" value="'+field_value+'">').insertAfter($select.parent().parent());
						}else{
							//选择回调
							if(typeof(field.select)=='function'){
								layui.form.on('select(select-'+field.field+')', function(data){
									field.select(data,field);
								});
							}
						}
					}						                			
				}else{
					layer.msg(field.name+'请求没有数据');
				}
				
			}
		},field.option));
		//联动select		
		if('linkage' in field){
			var linkage=field.linkage,
				field_name_width=16;
				field_name_marginRight=3;
				field_marginTop='10px';
			field.value=field.value.split(field.separator?field.separator:'-');
			var field_value_width=(100-field_name_width-field_name_marginRight)/field.value.length;				
			$mix_field_value
				.css({width:field_value_width+'%'})
				.prev('.mix-field-name').css({width:field_name_width+'%'});
			//请求联动数据
			jq.fn.linkageData=function(opt){
				var select=this;
				jq.mixAjax(jq.extend({
					data:{value: opt.values.queryValue},
					errorMsg: opt.field.name+'联动请求失败',
					success: function(link_data){
						if('data' in link_data){
							select.optionAppend({
								options:link_data.data,
								field: opt.field,
								value: opt.values.defaultValue
							});
							layui.form.render('select',opt.field.field);
						}else{
							layer.msg(opt.field.name+'联动请求没有数据');
						}
					}
				},opt.ajaxOption));
				return this;
			}	
			//选择事件
			jq.fn.selectOn=function(opt){
				var $selectOn=this,
					count=$selectOn.siblings().length,
					layFilter=$selectOn.find('select').attr('lay-filter');
				layui.form.on('select('+layFilter+')', function(data){
					opt.values={
						queryValue: data.value,
						defaultValue: ''
					};
					var count= $selectOn.siblings().length,
						$next=jq(data.elem).parent().next();
					opt.ajaxOption=jq.extend({},opt.field.option,opt.field.linkage[jq(data.elem).parent().index()-1]);
					if($next.length){
						$next.find('select')
							.empty()
							.linkageData(opt);
					}else{
						//增加选择框
						if(count-1<opt.field.linkage.length){
							jq(data.elem).parent().selectAppend(opt);
						}
					}
					//选择值
					var values=[];
					jq(data.elem).parent().siblings().andSelf().children('select').each(function(index,dom){
						if(dom.value){
							values.push(dom.value);
						}
					});
					jq(data.elem).closest('.mix-form-field').siblings('input').val(values.join(opt.field.separator?opt.field.separator:'-'));
					//选择回调
					if(typeof(opt.field.select)=='function'){
						opt.field.select(data,opt.field);
					}else{					
						if(typeof(opt.ajaxOption.select)=='function'){
							opt.ajaxOption.select(data,opt.field);
						}
					}
				});
				return this;
			}
			//增加选择框
			jq.fn.selectAppend=function(opt){
				var $selectAppend=this,//需要增加的前一个对象
					count=$selectAppend.siblings().length,
					linkage_field=$selectAppend.clone()
						.removeAttr('style')
						.css({width:opt.field_value_width+'%'})
						.appendTo($selectAppend.parent());					
				//换行
				if(!(count%opt.field.value.length)){
					linkage_field.css({marginLeft:field_name_width+field_name_marginRight+'%'});
				}
				//行距
				if(count>=opt.field.value.length){
					linkage_field.css({marginTop:field_marginTop});
				}
				opt.ajaxOption=jq.extend({},opt.field.option,opt.field.linkage[$selectAppend.index()-1]);		
				linkage_field.find('select')
					.empty()
					.removeAttr('name')
					.attr({'lay-filter':'select-'+opt.field.field+'-linkage_'+count})
					.linkageData(opt)
					.end().selectOn(opt);	
				return this;
			}			
			//根据value来生成select
			var ajaxOption=field.option;
			field.value.forEach(function(value, index, values){
				var selectOption={
					values: {
						queryValue: field.value[index-1],
						defaultValue: field.value[index]
					},
					field: field,
					field_value_width: field_value_width
				};
				if(index){	
					$mix_field_value.siblings().andSelf().last().selectAppend(selectOption);
				}else{
					$mix_field_value.selectOn(selectOption);
				}		
		
			});		
		}
		return this;			
	},
	//表单提交界面配置方法
	form: function(option){
		var form=this;	
		//fieldset
		if(typeof(option.fieldData.fieldset)=='object'){
			var form_id=option.fieldData.fieldset.id;
			var fieldset_name=option.fieldData.fieldset.name;
		}else{
			var fieldset_name=option.fieldData.fieldset;
			var form_id='info';
		}
	    var $fieldset=jq(
	        '<fieldset id="fieldset-'+form_id+'" class="layui-elem-field layui-field-title" style="display:none;'+(fieldset_name?'':'border:0px;')+'">\
	            '+(fieldset_name?'<legend>'+fieldset_name+'</legend>':'')+'\
	        </fieldset>'
	    ).appendTo(form);				
		//加载依赖文件
		jq.require([
			allRequireFile.formCss,
			allRequireFile.layuiCss,	
			allRequireFile.layuiJs,	
		],function(loadedFiles,unloadedFiles){	
			//对配置格式进行处理
			var dataHandle=function(data){
				if('data' in data){  	
					if(!jq(form).hasClass('mix-form')){
						jq(form).addClass('mix-form');
					}
					$fieldset.show();
					for(var key in option.fieldData.fields){
						var row=option.fieldData.fields[key],
							row_n=Math.floor(1/row.length*100),
							row_obj=jq('<div class="layui-form-item"></div>').appendTo($fieldset);
						for(var k in row){
							var field=row[k],
								form_field; 
							field=jq.extend({
								type:'',
								field: '',
								value: 'field' in field && field.field in data.data?data.data[field.field]:'',
								name: '',
								readonly: false,
								min: '',
								max: ''
							},field);  
							//其他类型字段元素处理         				            			
							if('type' in field){
								var readonly_class=field.readonly?'mix-field-readonly':'',
									readonly=field.readonly?'readonly':'';
								switch(field.type){
									case '': form_field=
										'<div class="mix-form-field" style="width:'+row_n+'%">\
											<label class="mix-field-name">'+field.name+'</label>\
											<div class="mix-field-value layui-form">\
												<div style="display:none;"></div>\
											</div>\
										</div>'; 
									break;
									case 'textarea': form_field=
										'<div class="mix-form-field" style="width:'+row_n+'%">\
											<label class="mix-field-name" style="width:16%">'+field.name+'</label>\
											<div class="mix-field-value layui-form" style="width:79%;margin-right: 1.5%;">\
												<textarea name="'+form_id+'['+field.field+']" class="layui-textarea '+readonly_class+'" '+readonly+'>'+field.value+'</textarea>\
											</div>\
										</div>'; 
									break;
									case 'image': form_field=
										'<div class="mix-form-field" style="width:'+row_n+'%">\
											<label class="mix-field-name">'+field.name+'</label>\
											<div class="mix-field-value layui-form">\
												<img class="mix-field-image" src="'+field.value+'" style="cursor:pointer;">\
												<input type="hidden" name="'+form_id+'['+field.field+'][filepath]">\
												<input type="hidden" name="'+form_id+'['+field.field+'][filename]">\
											</div>\
										</div>';
									break;
									case 'number': form_field=  
										'<div class="mix-form-field" style="width:'+row_n+'%">\
											<label class="mix-field-name">'+field.name+'</label>\
											<div class="mix-field-value layui-form">\
												<input type="number" name="'+form_id+'['+field.field+']" min="'+field.min+'" max="'+field.max+'" class="layui-input '+readonly_class+'" value="'+field.value+'" '+readonly+'>\
											</div>\
										</div>';
									break;
									case 'select': form_field=  
										'<div class="mix-form-field" style="width:'+row_n+'%">\
											<label class="mix-field-name">'+field.name+'</label>\
											<div class="mix-field-value layui-form">\
												<select name="'+form_id+'['+field.field+']" lay-search="" lay-filter="select-'+field.field+'">\
												</select>\
											</div>\
										</div>';
									break;
									default: form_field=
										'<div class="mix-form-field" style="width:'+row_n+'%">\
											<label class="mix-field-name">'+field.name+'</label>\
											<div class="mix-field-value layui-form">\
												<input type="text" name="'+form_id+'['+field.field+']" class="layui-input '+readonly_class+'" value="'+field.value+'" '+readonly+'>\
											</div>\
										</div>'; 
								}   
							}
							var $form_field=jq(form_field).appendTo(row_obj),
								$field_value=$form_field
									.find('.mix-field-value')
									.attr('lay-filter',function(index,v){
										if('layVerify' in field){
											jq(this).attr('lay-verify',field.layVerify);
										}										
										return v?v:field.field;
									});
							layui.use('form',function(){
								//字段数据处理 
								if(field.type=='date'){
									var dateOption={
										elem: 'input[name="'+form_id+'['+field.field+']"]',
										format: 'yyyy-MM-dd', 
										istime: true, //是否开启时间选择
										istoday: true, //是否显示今天
										issure: true, //是否显示确认
										max: 0,
										value: field.value,
										ready: function(){
											jq('.layui-laydate').parent().css({position:'relative'});
										}
									};
									if('dateOption' in option){
										dateOption=jq.extend(dateOption,field.option);
									}
									layui.laydate.render(dateOption);
								}else if(field.type=='image'){
									var uploadInst = layui.upload.render({
										elem: $form_field.find('.mix-field-image').get(0)
										,url: '?m=admin&c=attachment&a=public_upload_delete&type=upload&fieldid=equipment_image'
										,field: ''+form_id+'['+field.field+']'
										,before: function(obj,b){
											var upload=this;
											obj.preview(function(index, file, result){
												upload.elem.attr('src', result); //图片链接（base64）
											});
										}
										,done: function(res){
											if(res.code > 0){
												return layer.msg('上传失败');
											}
											jq('input[name="'+this.field).remove();
											jq('input[name="'+this.field+'[filepath]"]').val(res.path);
											jq('input[name="'+this.field+'[filename]"]').val(res.filename);
										}
										,error: function(){
											var demoText = jq('#demoText');
											demoText.html('<span style="color: #FF5722;">上传失败</span> <a class="layui-btn layui-btn-mini demo-reload">重试</a>');
											demoText.find('.demo-reload').on('click', function(){
												uploadInst.upload();
											});
										}
									});	
									jq('input[name="'+''+form_id+'['+field.field+']'+'"]').remove();				            	
								}else if(field.type=='select'){
									field.id=form_id;
									$field_value.select(field);	
								}
							});			        
						}
					}
				}else{
					if('msg' in data){
						layer.msg(data.msg);
					}else{
						layer.msg('请求没有数据');
					}
				}				
			}
			if('ajaxOption' in option){
				//有数据请求 一般为编辑页面
				jq.mixAjax(jq.extend({
					success: function(data){ 
						if(typeof(option.dataParse)=='function'){
							data.data=option.dataParse(data);
						}					        		
						dataHandle(data);
					}	        				
				},option.ajaxOption));
			}else{
				//无数据请求 一般为添加页面
				var data={data:[]};
				if(typeof(option.dataParse)=='function'){
					data.data=option.dataParse(data);
				}				
				dataHandle(data);
			}
		});	 
        return this;   				
	},
	//文字过长省略处理方法
    textEllipsis: function(option){
    	var obj=this;
    	jq.require([allRequireFile.fnCss],function(loadedFiles,unloadedFiles){
	        option=jq.extend(true,{
	            style: {
	                display: 'inline-block',
	                textOverflow: 'ellipsis',
	                overflow: 'hidden',
	                whiteSpace: 'nowrap',
	                maxWidth: '180px',
	                verticalAlign: 'middle'
	            },
	        },option);
	        jq(obj)
	            .css(option.style)
	            .mouseover(function(event){
	            	if(jq(this).width()>=parseFloat(option.style.maxWidth)){
		            	event.stopPropagation();
		                var offset=jq(this).offset();
			            var text=jq(this).html();  
			            if(jq('.mix-text-ellipsis-tip').length){            
							var tip=jq('.mix-text-ellipsis-tip');
			            }else{
				            var tip=jq('<div class="mix-text-ellipsis-tip">'+text+'</div>')
				                .appendTo('body')   
			            }
			            var height=jq(this).height()-2;
			            tip
			            	.unbind('mouseout')
			                .attr('style','position:fixed;top:'+offset.top+'px;left:'+offset.left+'px;line-height:'+height+'px;')              
			                .html(jq(this).html())
			                .mouseout(function(event){
			                	event.stopPropagation();
			                    jq(this).css('display','none');
			                });
			        }	            
	            });
	        if(typeof(option.callback)=='function'){
	            option.callback(jq(obj),option);
	        }
    	});
        return this;
    },
	//表单查看界面配置方法
    table_view: function(option){	
    	var table=this;
		jq.require([
			allRequireFile.layuiCss,
			allRequireFile.layuiJs
		],function(loadedFiles,unloadedFiles){
			jq.mixAjax(jq.extend({
				success: function(data){
					if(typeof(option.dataParse)=='function'){
						data.data=option.dataParse(data);
					}					
					if('data' in data){
						for(var key in option.fieldData){
							var fieldset=option.fieldData[key];
							var tr=jq('<tr>').appendTo(table);
							for(var k in fieldset){
								var d=fieldset[k];
								d.value=d.field in data.data?data.data[d.field]:'';
								jq('<td width="25%"><span class="mix-info-content_name">'+d.name+'：</span><span class="mix-info_content_value">'+d.value+'</span></td>')
									.appendTo(tr)
									.find('.mix-info_content_value').textEllipsis({
										callback:function(obj,option){
											obj.parent().css({whiteSpace:'nowrap'});
										}
									})
							}
						}
					}else{
						if('msg' in data){
							layer.msg(data.msg);
						}else{
							layer.msg('请求没有数据');
						}
					}
				}
			},option.ajaxOption));
		});	    	
	},
	//生成卡片
	cardItem0: function(option){
		var row=this;
		jq.require([
			allRequireFile.cardCss
		],function(loadedFiles,unloadedFiles){
			option=jq.extend(true,{
				tpl:{
					unit: '',
					color: '#eff3f8',
					value: '-',
					name: '',
					attribute: '',
				},
				itemWidth: '210px',
				prefix:''
			},option);
	        jq(
	        	'<div class="mix-card-item" style="width: '+option.itemWidth+';height:100%;background:'+option.tpl.color+'">\
					<div class="mix-card-content">\
				        <div class="mix-card-value"><span id="'+option.prefix+'-'+option.tpl.attribute+'">'+option.tpl.value+'</span></div>\
				        <div class="mix-card-title"><span class="mix-card-name">'+option.tpl.name+'</span><span class="mix-card-unit">'+(option.tpl.unit?'/'+option.tpl.unit:'')+'</span></div>\
					</div>\
				</div>'
	        ).appendTo(row)
	        .data('tpl',option.tpl);
		});
        return this;
	},
	//生成卡片组
	cardGroup0: function(option){
		var cardGroup=this;
		jq.require([
			allRequireFile.cardCss
		],function(loadedFiles,unloadedFiles){		
			if(!jq(this).hasClass('mix-card')){
				jq(this).addClass('mix-card');
			}
			option=jq.extend(true,{
				tpl:[],
				itemWidth: '210px',
				RowHeight: '',
				panelHeight: 'auto',
				prefix:''	
			},option);
			jq(this).css({height:option.panelHeight});
			var tpl=option.tpl;
		    for(var key in tpl){
		    	var row=tpl[key];
		    	var row_count=tpl.length;
		    	var col_count=row.length;
		    	var $row = jq('<div class="mix-card-row" style="height:'+(option.RowHeight?option.itemHeight:1/row_count*100+'%')+';">').appendTo(cardGroup);
		    	for(var k in row){
			        $row.cardItem({
			        	tpl: row[k],
						itemWidth: option.itemWidth,
						RowHeight: option.RowHeight,
						panelHeight: option.panelHeight,
						prefix:option.prefix
			        });
		    	}
		    }
		});
		return this;
	},
	cardGroup: function(option){
		var $cardGroup=this;
		jq.require([
			allRequireFile.cardCss
		],function(loadedFiles,unloadedFiles){
			option=jq.extend({
				tpl: [],
				prefix: '',
			},option);
			$cardGroup.empty();
			if(!$cardGroup.hasClass('mix-card-group')){
				$cardGroup.addClass('mix-card-group');
			}
			for(var key in option.tpl){
				d=jq.extend({
					attribute: '',
					unit: '',
					value: 0,
					name: '',
				},option.tpl[key]);
				jq(
					'<div class="mix-card">\
						<div class="mix-card-value-unit">\
							<span class="mix-card-value" id="'+(option.prefix?'-'+option.prefix:'')+d.attribute+'">'+d.value+'</span>\
							<span class="mix-card-unit">'+d.unit+'</span>\
						</div>\
						<div class="mix-card-name">'+d.name+'</div>\
					</div>'
				).data('data',d)
				.appendTo($cardGroup);	
			}
		})
	},
	//关闭小按钮
	close:function(option){
		option=jq.extend({},option);
		$close=this.css({position:'relative'});
		$close.children('.mix-close').remove();
		jq('<span class="mix-close" style="position:absolute;top:-6px;right:-6px;border-radius:12px;font-size:12px;border:1px solid #dddddd;display:inline-block;width:12px;height:12px;text-align:center;cursor:pointer;line-height: 12px;">×</span>')
			.appendTo(this)
			.click(function(event){
				event.stopPropagation();
				$parent=jq(event.target).parent()
				if(typeof(option.before)=='function'){
					res=option.before(event,$parent);
					if(res==false){
						return false;
					}
				}
				$parent.remove();
			});	
		return this;
	},
	//颜色选择组件
	color:function(option){
		var $color=this;
		jq.require([
			allRequireFile.jqueryUiCss,
			allRequireFile.jqueryUiJs
		],function(loadedFiles,unloadedFiles){	
			var default_option={
				width: '20px',
				height: '20px',
				color: 'white',
				border: '1px solid #c5c5c5',
				close: true,
				appendTo: 'body',
				scroll: 'body',
			}
			option=jq.extend(default_option,option);
			//颜色组件事件取消与绑定
			var my_color_event=function(obj,color_obj){
					obj.find('.my_color_item').unbind('click').click(function(){
						color_obj.css({'background':jq(this).css('background')});
					});							
					obj.find('.my_color_slider').slider({
						min: 0,
						max: 360,
						slide: function(event,ui){
							var r=0;
							var g=0;
							var b=0;
							var rgb=function(value){
								var rgb = {};
								var h = value;
								var s = 255
								var v = 255
								var t1 = v;
								var t2 = (255-s)*v/255;
								var t3 = (t1-t2)*(h%60)/60;
								if(h==360) h = 0;
								if(h<60) {rgb.r=t1;	rgb.b=t2; rgb.g=t2+t3}
								else if(h<120) {rgb.g=t1; rgb.b=t2;	rgb.r=t1-t3}
								else if(h<180) {rgb.g=t1; rgb.r=t2;	rgb.b=t2+t3}
								else if(h<240) {rgb.b=t1; rgb.r=t2;	rgb.g=t1-t3}
								else if(h<300) {rgb.b=t1; rgb.g=t2;	rgb.r=t2+t3}
								else if(h<360) {rgb.r=t1; rgb.g=t2;	rgb.b=t1-t3}
								else {rgb.r=0; rgb.g=0;	rgb.b=0}
								return [Math.round(rgb.r),Math.round(rgb.g),Math.round(rgb.b)];
							}
							var rgb_str=rgb(ui.value).join();
							color_obj.css({background:'rgb('+rgb_str+')'});
							jq(ui.handle).css({background:'rgb('+rgb_str+')'});
						}
					}).css('background','linear-gradient(to right,red,orange,yellow,green,blue,indigo,violet,red)');			
			}
			$color.click(function(event){
				event.stopPropagation();
				var color_obj=jq(this);
				var offset=jq(this).offset();
				var width=200;
				var height=50;
				var top=offset.top-height+jq(option.scroll).scrollTop()-6;
				top=top<0?0:top;
				var left=offset.left+jq(option.scroll).scrollLeft();
				if(jq('.my_color').length){
					var obj=jq('.my_color').css({top: top+'px',left: left+'px'});
					my_color_event(obj,color_obj);
				}else{	
					var my_color_item_style="display:inline-block;width:20px;height:20px;border:1px solid #c5c5c5;cursor:pointer;";	
					var obj=jq(
						'<div class="my_color" style="width:'+width+'px;height:'+height+'px;position:absolute;top:'+top+'px;left:'+left+'px;border:1px solid #c5c5c5;z-index:999;display:none;text-align:justify;padding:1px;">\
							<div class="my_color_item" style="'+my_color_item_style+'background:#5387ff"></div>\
							<div class="my_color_item" style="'+my_color_item_style+'background:#53b8ff"></div>\
							<div class="my_color_item" style="'+my_color_item_style+'background:#67c23a"></div>\
							<div class="my_color_item" style="'+my_color_item_style+'background:#fa5555"></div>\
							<div class="my_color_item" style="'+my_color_item_style+'background:#eb9e05"></div>\
							<div class="my_color_item" style="'+my_color_item_style+'background:#808898"></div>\
							<div class="my_color_item" style="'+my_color_item_style+'background:black"></div>\
							<div class="my_color_slider" style="width:90%;margin:5px 5% 0px 5%;display:inline-block"></div>\
						</div>'
					).appendTo(option.appendTo);
					jq(option.appendTo).css({position:'relative'});
					jq('body').click(function(event){
						obj.fadeOut();
					});	
					my_color_event(obj,color_obj);
				}
				if(obj.css('display')=='none'){
					obj.fadeIn();
				}	
			});
			//关闭
			if(option.close){
				$color.close();
			}
			//console.log(option,$color);
			$color.css({
				'width':option.width,
				'height':option.height,
				'background':option.color,
				'border':option.border,
				'display':'inline-block',
				'vertical-align':'middle',
				'position':'relative'
			});
		});			
	},
	edit: function(option){
		$body=this;
		$edit=jq('<div class="my-edit-button"><i class="fa fa-pencil-square-o fa-2x" aria-hidden="true"></i></div>');
		jq.require([
			allRequireFile.fnCss,
		],function(loadedFiles,unloadedFiles){	
			jq('body').css({position:'relative'});
			$edit
				.appendTo($body)
				.draggable({
					containment: 'parent',
					addClasses: false,
					scroll: false,
					cursor: 'move',
					opacity: 0.5
				}).get(0).addEventListener('tap',function(event){
					if(typeof(option.tap)=='function'){
						option.tap(event,$edit,option)
					}
				});
		});
		return $edit;
	}		
});