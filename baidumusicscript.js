// ==UserScript==
// @name	百度音乐助手
// @author	有一份田
// @description	百度音乐下载助手,突破百度音乐会员限制,带您自由畅享高品质音乐
// @namespace	http://userscripts.org/scripts/show/175746
// @updateURL	https://userscripts.org/scripts/source/175746.meta.js
// @downloadURL	https://userscripts.org/scripts/source/175746.user.js
// @icon	http://img.duoluohua.com/appimg/script_baidumusicscript_icon_48.png
// @license	GPL version 3
// @encoding	utf-8
// @include	http://music.baidu.com/song/*
// @grant       GM_xmlhttpRequest
// @run-at	document-end
// @version	1.2.3
// ==/UserScript==





/*
 * === 说明 ===
 *@作者:有一份田
 *@官网:http://www.duoluohua.com/download/
 *@Email:youyifentian@gmail.com
 *@Git:http://git.oschina.net/youyifentian
 *@转载重用请保留此信息
 *@最后修改时间:2013.10.26
 *
 * */


var APPNAME='百度音乐助手';
var VERSION='1.2.3';
var t=Math.random();
querySong(getSongInfo());
function querySong(opt){
	if(!opt.id) return;
	var box=document.getElementsByClassName(opt['boxCss']);
	if(!box.length)return;
	var node=document.createElement('div'),o=box[0];
	node.style.display='block';
	o[opt['addNodeFun']](node,o[opt['child']]);
	try{
		o.parentNode.parentNode.parentNode.style.minWidth=opt['boxWidth'];
	}catch(err){}
	if(!GM_xmlhttpRequest){
		showDownHtml(node,'',4);
		return;
	}
	showDownHtml(node,'',1);
	var id=opt.id,title=opt.title,artist=opt.artist,
	    url='http://musicmini.baidu.com/app/link/getLinks.php?linkType=1&isLogin=1&clientVer=8.2.5.2&isHq=1&songAppend=&isCloud=0&hasMV=1&songId='+id+'&songTitle='+title+'&songArtist='+artist;
	GM_xmlhttpRequest({
		method: 'GET',
		url: url,
		onload: function(response) {
			showDownHtml(node,JSON.parse(response.responseText),0);
		},
		onerror: function(response) {
			showDownHtml(node,'',2);
		},
		ontimeout: function(response) {
			showDownHtml(node,'',3);
		}
	});
}
function getSongInfo(id,title,artist){
	var path=window.location.pathname,arr=path.split('/'),id=arr[2] || id,p=arr[3],
	    type=p && 'download'==p.toLowerCase();
	return {
		"id":"song"==arr[1].toLowerCase() ? id : "",
		"title":title || "",
		"artist":artist || "",
		"boxCss": type ? "ul" : "info-holder",
		"addNodeFun":type ?  "appendChild" : "insertBefore",
		"child": type ? "lastChild" : "firstChild",
		"boxWidth": type ? "670px" : ""
	};
}
function setSongsInfo(opt){
	var o=opt[0],id=o.song_id,lyric=o.lyric_url,albumImg=o.album_image_url,
	    artist=o.song_artist,title=o.title,fileslist=o.file_list,files=[];
	for(var i=0;i<fileslist.length;i++){
		files.push(formatSongInfo(fileslist[i],lyric));
	}
	return {
		"id":id,
		"title":title,
		"artist":artist,
		"albumImg":albumImg,
		"lyric":lyric,
		"files":files
	};
}
function formatSongInfo(file){
	var url=file.url,format=file.format.toLowerCase(),
	    size=file.size,rate=file.kbps,i=0,
	    ratetitle=['无 损','超 高','高 质','标 准','低 质','其 他'];
	if(rate>320 && format!="mp3"){
		i=0;
	}else if(rate>256 && rate<=320){
		i=1;
	}else if(rate>128 && rate<=256){
		i=2;
	}else if(rate>64 && rate<=128){
		i=3;
	}else if(rate<=64){
		i=4;
	}else{
		i=5;
	}
	size=Math.round(size/1048576*10)/10+'M';
	return {
		"index":i,
		"format":format,
		"rate":rate,
		"ratetitle":ratetitle[i],
		"size":size,
		"url":url
	};
}
function showDownHtml(node,opt,index){
	var msg=[
		'',
	    	'数据赶来中',
		'请求出错,请重试或检查是否为最新版本',
		'请求超时,请刷新页面重试',
		'您的油猴子扩展暂时不支持该脚本,请更新扩展或脚本到最新版本'
	],filesInfo=opt ? setSongsInfo(opt) : {},text=msg[index],
	html=makeHtml(filesInfo,text,index-1);
	node.innerHTML=html;
	node.title=APPNAME;
	checkUpdate();
}
function makeHtml(filesInfo,text,type){
	var files=filesInfo.files || [],html='',file='',url='',albumImg=filesInfo.albumImg,lyric=filesInfo.lyric;
	html+='<div style="border:2px solid #A1CBE4;width:560px;padding-left:25px;margin:5px 0px 10px 0px;line-height:25px;">';
	html+='<div>';
	html+='<a href="'+getUpdateUrl('getnewversion',1)+'" style="float:right;" target="_blank">';
	html+='<img id="updateimg" title="有一份田" style="border:none;display:none;"/></a>';
	html+=text ? '<font color="'+(type ? '#FF0000' : '#A1CBE4')+'"><b>'+text+'...</b></font>' : '';
	for(var i=0;i<files.length;i++){
		file=files[i];
		url="http://music.baidu.com/data/music/file?link="+file.url;
		html+='<span style="display:inline-block;min-width:200px;">';
		html+='<a style="text-decoration:underline;" href="'+url+'" title="'+file.ratetitle+'"><b>'+file.ratetitle+'</b></a>';
		html+='<span><b>&nbsp;&nbsp;&nbsp;'+file.size+'</b></span>';
		html+='<span style="color:#999999;">&nbsp;&nbsp;&nbsp;'+file.format+'&nbsp;&nbsp;'+file.rate+'kbps</span>';
		html+='</span>';
		if(i%2==1)html+='</div><div>';
	}
	html+='</div><div>';
	html+=albumImg ? '<span style="margin-right:100px;"><a style="text-decoration:underline;" target="_blank" href="'+albumImg+'" title="专辑封面">专辑封面</a></span>' : '';
	html+=lyric ? '<span><a style="text-decoration:underline;" href="'+lyric+'" title="下载歌词">LRC歌词</a></span>' : '';
	html+='</div></div>';
	return html;
}
function checkUpdate(){
	var js='var upinfo=document.getElementById("updateimg");';
	js+='upinfo.src="'+getUpdateUrl('checkupdate',1)+'";';
	js+='upinfo.onload=function(){';
	js+='upinfo.style.display="inline-block";';
	js+='}';
	loadJs(js);
}
function getUpdateUrl(action,type){
	return 'http://app.duoluohua.com/update?action='+action+'&system=script&appname=baidumusicscript&apppot=scriptjs&frompot=songweb&type='+type+'&version='+VERSION+'&t='+t;
}
function loadJs(js){
	var oHead=document.getElementsByTagName('HEAD')[0],
	    oScript= document.createElement('script'); 
	oScript.type = 'text/javascript'; 
	oScript.text =js;
	oHead.appendChild( oScript); 	
}
function googleAnalytics(){
	var js="var _gaq = _gaq || [];";
	js+="_gaq.push(['_setAccount', 'UA-43134902-1']);";
	js+="_gaq.push(['_trackPageview']);";
	js+="function googleAnalytics(){";
	js+="	var ga = document.createElement('script');ga.type = 'text/javascript';";
	js+="	ga.async = true;ga.src = 'https://ssl.google-analytics.com/ga.js';";
	js+="	var s = document.getElementsByTagName('script')[0];";
	js+="	s.parentNode.insertBefore(ga, s)";
	js+="}";
	js+="googleAnalytics();";
	js+="_gaq.push(['_trackEvent','query_gm',String(new Date().getTime())]);";
	loadJs(js);
}
googleAnalytics();

