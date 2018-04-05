<?php
class dir{
	static $route='&';
	function __construct(){
	}
	//加载类
	static function include_class($class,$m='', $instantiated=0,$file=''){
		if(!$file){
			$class_dirname=$m?'module'.DIRECTORY_SEPARATOR.$m.DIRECTORY_SEPARATOR.'class':'class';
			$file=ROOT.DIRECTORY_SEPARATOR.$class_dirname.DIRECTORY_SEPARATOR.$class.'.php';
		}
		if(is_file($file)){
			include $file;
		}else{
			die('类文件'.$file.'不存在');
		}
		if($instantiated){
			if(class_exists($class)){
				return new $class();
			}else{
				die('类'.$class.'不存在');
			} 
		}	
		
	}
	//加载模版
	static function include_tpl($tpl='',$m='',$file=''){ 
		if(!$file){
			//默认根目录同名模板
			if(!$tpl && !$m){
				$config=self::get_config('template',M.'_'.C);
				if($config){
					$tpl=$config['t'];
					$m=$config['m'];
				}
			}
			//默认根目录同名模板
			$tpl=$tpl?$tpl:A;
			$file=ROOT.DIRECTORY_SEPARATOR
				.($m?'module'.DIRECTORY_SEPARATOR.$m.DIRECTORY_SEPARATOR:'').'template'.DIRECTORY_SEPARATOR
				.(self::isMobile()?'app':'pc').DIRECTORY_SEPARATOR
				.$tpl.'.php';
		}
		if(is_file($file)){
			include $file;
		}else{
			die('模板文件'.$file.'不存在');
		}			
	}
	//加载配置
	static function get_config($filename='',$item='',$m=''){
			$config_dirname=$m?'module'.DIRECTORY_SEPARATOR.$m.DIRECTORY_SEPARATOR.'config':'config';
			$file=ROOT.DIRECTORY_SEPARATOR.$config_dirname.DIRECTORY_SEPARATOR.$filename.'.php';
			if(is_file($file)){
				$config=include $file;
				if($config && isset($config[$item])){
					return $config[$item];
				}else{
					return '';
				}
				return $config;
			}else{
				die('配置文件'.$file.'不存在');
			}
	}
	//路由转换
	static function route($url,$output='echo'){		
		$param=parse_url($url);
		if(isset($param['query'])){
			parse_str($param['query'],$mca);
			$mca['m']=isset($mca['m']) && $mca['m']?$mca['m']:'admin';
			$mca['c']=isset($mca['c']) && $mca['c']?$mca['c']:'view';
			$mca['a']=isset($mca['a']) && $mca['a']?$mca['a']:'';
			if(self::$route=='/'){			
				$config=self::get_config('template',$mca['m'].'_'.$mca['c']);
				if($config&&$config['t']){
					$mca['a']=$config['t'];
				}
				$url= 'html/'.(self::isMobile()?'app.':'').$mca['a'].'.html?';
			}else{
				$url='?m='.$mca['m'].'&c='.$mca['c'].'&a='.$mca['a'].'&';
			}
		}
		if($output=='echo'){
			echo $url;
		}else{
			return $url;	
		}
	}
	//是否移动端
	static function isMobile(){ 
	    // 如果有HTTP_X_WAP_PROFILE则一定是移动设备
	    if (isset ($_SERVER['HTTP_X_WAP_PROFILE'])){
	        return true;
	    } 
	    // 如果via信息含有wap则一定是移动设备
	    if (isset ($_SERVER['HTTP_VIA'])){ 
	        // 找不到为flase,否则为true
	        return stristr($_SERVER['HTTP_VIA'], "wap") ? true : false;
	    } 
	    // 脑残法，判断手机发送的客户端标志,兼容性有待提高
	    if (isset ($_SERVER['HTTP_USER_AGENT'])){
	        $clientkeywords = array ('nokia',
	            'sony',
	            'ericsson',
	            'mot',
	            'samsung',
	            'htc',
	            'sgh',
	            'lg',
	            'sharp',
	            'sie-',
	            'philips',
	            'panasonic',
	            'alcatel',
	            'lenovo',
	            'iphone',
	            'ipod',
	            'blackberry',
	            'meizu',
	            'android',
	            'netfront',
	            'symbian',
	            'ucweb',
	            'windowsce',
	            'palm',
	            'operamini',
	            'operamobi',
	            'openwave',
	            'nexusone',
	            'cldc',
	            'midp',
	            'wap',
	            'mobile'
	            ); 
	        // 从HTTP_USER_AGENT中查找手机浏览器的关键字
	        if (preg_match("/(" . implode('|', $clientkeywords) . ")/i", strtolower($_SERVER['HTTP_USER_AGENT']))){
	            return true;
	        } 
	    } 
	    // 协议法，因为有可能不准确，放到最后判断
	    if (isset ($_SERVER['HTTP_ACCEPT'])){ 
	        // 如果只支持wml并且不支持html那一定是移动设备
	        // 如果支持wml和html但是wml在html之前则是移动设备
	        if ((strpos($_SERVER['HTTP_ACCEPT'], 'vnd.wap.wml') !== false) && (strpos($_SERVER['HTTP_ACCEPT'], 'text/html') === false || (strpos($_SERVER['HTTP_ACCEPT'], 'vnd.wap.wml') < strpos($_SERVER['HTTP_ACCEPT'], 'text/html'))))
	        {
	            return true;
	        } 
	    } 
	    return false;
	}
}
?>

