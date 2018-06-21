	<?php
class view extends db{
	function __construct(){
		parent::__construct();
	}
	function __call($method,$args){
		try { 	
             
			 return call_user_func_array(array($this,$method),$args);
		} catch (Exception $e) { 
			printr($e);
		}
	}
	function index(){
		dir::include_tpl();
	}
	function me(){
		dir::include_tpl();
	}
	//编辑
	function me_edit(){
		dir::include_tpl();
	}	
	//列表查看
	function me_view(){
		dir::include_tpl();
	}
	//用户列表
	function user(){
		dir::include_tpl();
	}
}
?>