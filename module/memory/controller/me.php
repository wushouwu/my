<?php
class me extends controller{
	function __construct(){
		parent::__construct();
		$this->table='me';
	}
	function __call($method,$args){
		try { 	
			$this->select();
			 return call_user_func_array(array($this,$method),$args);
		} catch (Exception $e) { 
			printr($e);
		}
	}
	//添加编辑
	function edit(){
		$res=$this->T($this->table)->input($_REQUEST['info']);
		echo json_encode(array('res'=>$res));
	}
}
?>