const expressPlugs = require('express');//引入express插件
const websiteFileStream = require('fs');//引入fs插件
const websiteFilePath = require('path');//引入path插件
const websiteURLcontrolPoint = require('url');//引入url插件
const ResonpType = require('./ResonpType');//引入响应类型数据
let webServerControlPoint = '';//声明网站服务器的控制节点对象


let ServerPort = 8080;//声明网站默认的端口
let defaultHomePage = "index.html";//默认的主页
let websiteRootPath = "/"//网站的根目录

let extraRouteSetting=false;//额外的路由是否已调用标识

//外部引入区定义

let extraImportMod = "";//外部引入路由对象函数
let extraImportToF = "";//外部引入路由匹配符号
//外部引入区定义


//功能函数

function mainPage(clientReq, serverRes) {
    console.clear();
    let curReqFile = websiteURLcontrolPoint.parse(clientReq.url, true).pathname;

    let ablePath = "";//绝对文件路径
    let fileTypeStr = "";

    if (curReqFile === "/") {
        if (websiteRootPath !== "") {
            if (websiteRootPath !== "/") {
                ablePath = websiteFilePath.join(websiteRootPath, defaultHomePage);
            } else {
                ablePath = websiteFilePath.join(__dirname, defaultHomePage);
            }
        } else {
            ablePath = websiteFilePath.join(__dirname, defaultHomePage);
        }
        fileTypeStr = websiteFilePath.extname(ablePath).slice(1);
    } else if (curReqFile !== undefined) {
        if (websiteRootPath !== "") {
            ablePath = websiteFilePath.join(websiteRootPath, curReqFile);
        } else {
            ablePath = websiteFilePath.join(__dirname, curReqFile);
        }
        fileTypeStr = websiteFilePath.extname(ablePath).slice(1);
    }

    try {
        websiteFileStream.readFile(ablePath, function (errMsg, webfiledataStream) {
            if (errMsg) {
                serverRes.writeHead(404, {'Content-Type': `${ResonpType[fileTypeStr]};charset=utf8`});
                serverRes.end('');
                console.log(`${curReqFile.substr(1)} 文件不存在`);
                return;
            } else {
                serverRes.writeHead(200, {'Content-Type': `${ResonpType[fileTypeStr]};charset=utf8`});
                serverRes.end(webfiledataStream);//发送消息体
                return;
            }
        });
    } catch (e) {
        serverRes.writeHead(404, {'content-type': 'text/plain;charset=utf8'});
        serverRes.end('');
        console.log('默认的主页文件不存在');
    }
}

function onLauncher(RootPath, serverPort, defaultPage) {
    if ((RootPath !== "" && RootPath !== null && RootPath !== undefined) && (serverPort !== 80 || serverPort !== 443) && (defaultPage !== "" && defaultPage !== undefined && defaultPage !== null)) {
        ServerPort = serverPort;
        defaultHomePage = defaultPage;
        websiteRootPath = RootPath;
    }
    //服务启动部分
    try {
        console.clear();
        webServerControlPoint = expressPlugs();
        if (websiteRootPath === "/") {
            // let fds=console;
            console.warn('websiteRootPath形参传递过来的是“/”，仅能访问模块内部的测试页。如果是明确的网站根目录位置的，请填写完整！');
        }
        webServerControlPoint.listen(ServerPort, () => {
            console.clear();
            console.log(`网站服务启动成功！端口号：${ServerPort}`);
            if(extraRouteSetting!==true){
                webServerControlPoint.use('/', mainPage);
            }
        });
    } catch (e) {
        console.log('网站服务启动失败，请检查配置的数据是否正确！如需使用80、443端口，请将此脚本置于管理员(Root)模式运行!');
    }
    //服务启动部分
}

function extraImportRoute(routeObjMsg) {
    if (Object.prototype.toString.call(routeObjMsg)==='[object Object]') {
        for (let routeName in routeObjMsg) {
            extraImportToF = routeName;
            extraImportMod = routeObjMsg[routeName];
            webServerControlPoint.use(extraImportToF, extraImportMod);
        }

    } else if(Object.prototype.toString.call(routeObjMsg)==='[object Array]'){
        console.log('暂时不支持数组类型的数据！');
    }else{
        throw new Error('routeObjMsg形参只能接收对象类型的数据，不能为其他的类型！');
    }
    webServerControlPoint.use('/', mainPage);
}

//功能函数


module.exports = {onLauncher, extraImportRoute};
