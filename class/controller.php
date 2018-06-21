<?php
class controller extends db {
	function __construct(){
		parent::__construct();
		$this->db=$this->get_db();
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
			$table=$this->T($_REQUEST['table'])->select('*',$where,"`$sort` $dir","$start,$limit",'',$key);
			echo json_encode(array('res'=>1,'data'=>$table));
		}else{
			echo json_encode(array('res'=>0,'msg'=>'没有表'));
		}	
	}
	//查字段
	function fields(){
        if(isset($_REQUEST['table'])&& $_REQUEST['table']){
			//$sql="SELECT `COLUMN_NAME` field,`DATA_TYPE` type,`COLUMN_COMMENT` name FROM  `information_schema`.`COLUMNS` WHERE `TABLE_NAME` =  '{$_REQUEST['table']}' && TABLE_SCHEMA ='{$this->db}'";
			$information_schema=new db('information_schema');
			$output=$information_schema->T('COLUMNS')->select(
				'`COLUMN_NAME` field,`DATA_TYPE` type,`COLUMN_COMMENT` name,case `IS_NULLABLE` WHEN "YES" THEN "false" ELSE "true" end required,IFNULL("",`COLUMN_DEFAULT`) value',
				"`TABLE_NAME` =  '{$_REQUEST['table']}' and TABLE_SCHEMA ='{$this->db}'",
				"",'','','field');
			if(isset($output['id'])){
				$output['id']['type']='hidden';
			}
			echo json_encode(array('res'=>1,'data'=>$output));
        }else{
			echo json_encode(array('res'=>0,'msg'=>'没有表'));
		}
	}		
}
?>