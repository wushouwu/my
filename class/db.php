<?php
class db {
	private $con;
	private $db;
	private $table;
	function __construct($db='memory',$host='localhost',$user='root',$passord='passw0rd'){
		$con=mysqli_connect($host,$user,$passord,$db) or die('connect:'.mysqli_connect_error());
		$this->con=$con;
		$this->db=$db;
		mysqli_set_charset($con,'utf8') or die(mysqli_error($con));
	}
	//选择表字段数据
	function select($field='*',$where='',$order='',$limit='',$group='',$key='',$auto_backquote=1){
		$limit=$limit ? "limit $limit":'';
		$order=$order ? "order by $order":'';
		$group=$group ? "group by $group":'';
		$where=$where?"where $where":'';
		$table=$this->backquote($this->table);
		if($auto_backquote){
			if(!is_array($field)){
				$field = explode(',', $field);
			}
			array_walk($field, array($this, 'backquote'));
			$field = implode(',', $field);
		}
		$sql="select $field from $table $where $order $limit $group";
		return $this->query_fetch($sql,$key,$limit=='limit 1'||$limit=='limit 0,1'?1:0);
	} 
	//插入数据
	function insert($field_value=array()){
		if($field_value){
			$table=$this->backquote($this->table);
			$fields=$values=array();
			foreach($field_value as $field=>$value){
				$value=addslashes($value);
				$fields[]=$this->backquote($field);
				$values[]=$this->quotation($value);
			}
			$sql="insert into $table (".implode(',',$fields).") values(".implode(',',$values).")";
			return $this->query($sql,$con);
		}
	}
	//更新数据
	function update($field_value=array(),$where=''){
		if(!$field_value){
			return 0;
		}
		$table=$this->backquote($this->table);
		$sets=array();
		foreach($field_value as $field=>$value){
			$value=addslashes($value);
			$sets[]=$this->backquote($field).'='.$this->quotation($value);
		}
		$where=$where?"where $where":'';
		$sql="update $table set ".implode(',',$sets)." $where";
		return $this->query($sql);
	}
	//插入或更新数据
	function input($field_value=array(),$where='1'){
		if(!$field_value){
			return 0;
		}
		if(isset($field_value['id'])){
			$where=$where.' and `id`='.$field_value['id'];
			unset($field_value['id']);
			return $this->update($field_value,$where);
		}else{
			return $this->insert($field_value);
		}

	}	
	//查询返回数据
	function query_fetch($sql,$key='',$one_row=0){
		$res=$this->query($sql);
		return $this->fetch($res,$key,$one_row);
	}
	//查询返回资源
	function query($sql){
		$con=$this->con;
		$res=mysqli_query($con,$sql);
		if(!$res){
			die('query执行出错<br>'.PHP_EOL.$sql.'<br>'.PHP_EOL.mysqli_error($con));
		}
		return $res;
	}
	/*
		mysqli_fetch_assoc取数据
		$res	resource	数据资源
		$key	string	作为回返数据的下标
		$one_row	bool	是否返回一行
		return	array
	*/
	function fetch($res,$key='',$one_row=0){
		if($one_row){
			return mysqli_fetch_assoc($res);
		}else{
			$output=array();
			while($row=mysqli_fetch_assoc($res)){
				if($key && isset($row[$key])){
					$output[$row[$key]]=$row;
				}else{
					$output[]=$row;
				}
			}
			return $output;
		}
	}
	/*
		选择数据表
		$table	string	表名
		return resource
	*/
	function T($table){
		$this->table=$table;
		return $this;
	}
	/*
		返回当前连接的数据库名
		return string
	*/
	function get_db(){
		return $this->db;
	}	
	/*
		返回当前选择的数据表名
		return string
	*/
	function get_table(){
		return $this->table;
	}	
	//字段加反引号
	function backquote(&$value){
		if('*' == $value || false !== strpos($value, '(') || false !== strpos($value, '.') || false !== strpos ( $value, '`')) {
			//不处理包含* 或者 使用了sql方法。
		} else {
			$value = '`'.trim($value).'`';
		}
		return $value;
	}
	//字段值加引号
	public function quotation(&$value) {
		$q = "'";
		$value = $q.$value.$q;
		return $value;
	}	
}
?>