<?php
class api extends db{
	function __construct(){
		parent::__construct();
		ini_set('session.gc_maxlifetime', 3600*24*366);
		ini_set('session.cookie_lifetime', 3600*24*366);
		session_start();		
	}
	//app配置
	public function get_config(){
		$arr=array (
			'app'=>array (
				'company' => '深圳市智物联网络有限公司',
				'fidis_id' => 'wushouwu',
				'logo' => 'http://192.168.23.1/my/static/image/logo.gif',
				'push_token' => 'd9d585d6db3eda42f4e2f842209dff42',
				'title' => '深圳智物联',
				'title_bar_color' => '#2a69ff',
				'index'=>'http://192.168.23.1/my',
				'token'=>session_id()
			),
			'mqtt'=>array (
				'ip' => 'fk.test.fidis.cn',
				'port' => '1883',
			),
			'ret' => 0,
		);
		echo json_encode($arr);
	}
	//用户验证
	public function check_login_info(){		
		echo json_encode(array('ret'=>0, 'msg'=>array('result'=>'success.', 'user_identify'=>10001)));
	}
	//更新包更新
	public function profile(){

	    echo json_encode(array());
	}
	//检查更新
	public function check_update(){
		echo json_encode(array('ret'=>1, 'msg'=>'APP of this type is not exist.'));
	}	
}
?>

