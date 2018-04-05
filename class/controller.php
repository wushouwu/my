<?php
class controller extends db {
	function __construct(){
		parent::__construct();
	}
	//查表
	function table(){
		if(isset($_REQUEST['table']) && $_REQUEST['table']){
			$where=isset($_REQUEST['where'])?$_REQUEST['where']:'';
			$start=isset($_REQUEST['start']) ? $_REQUEST['start'] : 0;
			$limit=isset($_REQUEST['limit']) ? $_REQUEST['limit']: 10;
			$sort=isset($_REQUEST['sort'])?$_REQUEST['sort']:'id';
			$dir=isset($_REQUEST['dir'])?$_REQUEST['dir']:'desc';
			$field=isset($_REQUEST['field'])&&$_REQUEST['field']?$_REQUEST['field']:'*';
			$key=isset($_REQUEST['key'])?$_REQUEST['key']:'';
			$table=$this->select($_REQUEST['table'],'*',$where,"`$sort` $dir","$start,$limit",'',$key);
			echo json_encode(array('res'=>1,'data'=>$table));
		}else{
			echo json_encode(array('res'=>0,'msg'=>'没有表'));
		}	
	}
	//查字段
	function fields(){
        if(isset($_REQUEST['table'])&& $_REQUEST['table']){
			$sql='show full fields from `'.$_REQUEST['table'].'`';
			$ouput=$this->query_fetch($sql,'Field');
			echo json_encode(array('res'=>1,'data'=>$ouput));
        }else{
			echo json_encode(array('res'=>0,'msg'=>'没有表'));
		}
	}		
}
?>

