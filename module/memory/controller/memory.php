<?php
class memory extends db{
	function __construct(){
		parent::__construct();
		$this->table='`words`';
	}
	function __call($method,$args){
		try { 	
			$this->select();
			 return call_user_func_array(array($this,$method),$args);
		} catch (Exception $e) { 
			printr($e);
		}
	}
	function word($value='',$fields='`word`',$like=false,$field='`word`',$operator='='){
		$order='`priority` desc';
		$where="$field $operator '$value'";
		$output=$this->select($this->table,$fields,$where,$order,'1');
		if(!$output && $like){
			$field_name='count(`id`) count';
			$where="$field like '%$value%'";
			$count=$this->select($this->table,$field_name,$where,$order,'1');
			if($count['count']< 10){
				$output=$this->select($this->table,$fields,$where,$order);
			}else{
				$where.=" and `circle`='影响'";
				$count=$this->select($this->table,$field_name,$where,$order,'1');
				if($count['count']< 10){
					$output=$this->select($this->table,$fields,$where,$order);
				}else{
					$where.=" and `priority`>=3";
					$output=$this->select($this->table,$fields,$where,$order);
				}
			}
		}
		return $output;	
	}
	function root($row){
		$parent=$this->word($row['pid'],'*',false,$field='`id`');
		if($parent){	
			return $this->root($parent);
		}else{				
			return $row;
		}
	}
	function children($row){
		$children=$this->select($this->table,'*','`pid`='.$row['id'],'`priority` desc');
		if($children){
			foreach($children as $key=>$val){
				$children[$key]['children']=$this->children($val);
			}
			return $children;
		}else{
			return array();
		}
	}
	function all($word){
		$word=$this->word($word,'*');
		$root=$this->root($word);
		$root['children']=$this->children($root);
		return $root;
	}
}
?>