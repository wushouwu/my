<?php
header('Content-type:text/html;charset=utf-8');
include 'function.php';
define('INDEX',__FILE__);
dirname(INDEX);
$root=realpath('./');
define('ROOT',$root);	
include 'class/directory.php';
class index{
	function __construct(){
		$m=(isset($_REQUEST['m']) && $_REQUEST['m']? $_REQUEST['m']:'admin');
		$m_path=ROOT.DIRECTORY_SEPARATOR.'module'.DIRECTORY_SEPARATOR.$m;
		if(!is_dir($m_path)){
			die('模块不存在');
		}
		$c=(isset($_REQUEST['c']) && $_REQUEST['c']? $_REQUEST['c']:'view');
		$c_path=$m_path.DIRECTORY_SEPARATOR.'controller'.DIRECTORY_SEPARATOR.$c.'.php';
		dir::include_class('db');
		dir::include_class('controller');
		$controller=dir::include_class($c,'',1,$c_path);
		$a=isset($_REQUEST['a']) && $_REQUEST['a']?$_REQUEST['a']:'me';
		if(method_exists($c,$a)){
			define('M_PATH',$m_path);
			define('M',$m);
			define('C',$c);
			define('A',$a);
			$controller->$a();
		}else{
			die('方法不存在');
		}
	}
	function check_priv(){
		if(!isset($_SESSION)){
			die('没有登录');
		}
	}
}
new index();
?>