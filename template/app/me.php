<html>
<head>
<!--<link rel="import" href="template/app.head.php">-->
<?php 
    dir::include_tpl('head');
?>
<style>
    .mui-pull-right{
        color: #999999;
        font-size: 14rem;
    }
    #menu.mui-table-view .mui-media-object{
        height: 19px;
        width: 19px;
    }
    #menu .mui-navigate-right{
        font-size: 15rem;
        color: #333333;
    }
    #menu .mui-table-view-cell{
        height: 45px;
    }
    #menu.mui-table-view .mui-media-object img{
        width: 100%;
        height: 100%;
    }
    #menu .mui-table-view-cell:after{
        right: 21px;
    }    
</style>
</head>
<body>
    <div  class="mui-scroll-wrapper">
        <div class="mui-scroll">
               <ul class="mui-table-view" id="menu">
                   <li class="mui-table-view-cell">
					<div class="mui-media-object mui-pull-left">
						<img src="images/equipment/equipment_info.png">
					</div>
					<div class="mui-media-body">
					    <a class="mui-navigate-right"  href="<?php dir::route('?a=me_view&');?>table=me">个人档案</a>
					</div>
                   </li>
                   <li class="mui-table-view-cell">
    					<div class="mui-media-object mui-pull-left">
    						<img src="images/equipment/warning_record.png">
    					</div>
    					<div class="mui-media-body">
    					    <a class="mui-navigate-right" href="warning_record.html">知识库</a>
    					</div>
                   </li>
               </ul>        
        </div>
    </div>
</body>
</html>