const mySQLCont = require('mysql');

let dataLibraryMsg;//数据库连接信息体

let linkPoint;//数据库连接控制点
let dataLibraryConnectStatus = false;//数据库连接状态

function mysqlConnectData(receiverDataMsg) {
    if (Object.prototype.toString.call(receiverDataMsg) === '[object Object]') {
        dataLibraryMsg = receiverDataMsg;
    } else if (Object.prototype.toString.call(receiverDataMsg) === '[object String]') {

    } else {
        console.error('receiverDataMsg形参只能接收对象或特定格式的字符串');
    }
}

class MySQLOperaProcess {
    static basicQueryOperation = async function (mySQLCode, ...patM) {
        if (dataLibraryConnectStatus) {
            await linkPoint.query(mySQLCode, (errorMsg, queryGetData, extraMsg) => {
                console.log(queryGetData);
            });
        } else {
            console.warn('请先确认连接上数据库');
        }
    }
    static basicAdderOperation=async function(){

    }
}

async function mysqlConnectOn() {
    if ((Object.prototype.toString.call(dataLibraryMsg) === '[object Object]' || Object.prototype.toString.call(dataLibraryMsg) === '[object String]') && Object.prototype.toString.call(dataLibraryMsg) !== '') {
        linkPoint = mySQLCont.createConnection(dataLibraryMsg);
        await linkPoint.connect("", (connectStatus) => {
            try {
                if (connectStatus !== null) {
                    throw new Error();
                } else {
                    dataLibraryConnectStatus = true;
                    console.log('服务器连接成功');
                }
            } catch (e) {
                console.error('服务器连接失败');
            }
        });
    } else {
        console.error('调用mysqlConnectOn函数之前，请先调用mysqlConnectData函数接收传递过来的数据库连接信息结构体，或连接信息字符串。');
    }
}

function mysqlConnectOff() {
    if (dataLibraryConnectStatus) {
        linkPoint.end();
        dataLibraryConnectStatus = false;
        console.log('数据库连接已关闭');
    } else {
        console.warn('你没有数据库连接实例，无需执行此操作。');
    }
}

module.exports = {mysqlConnectOn, mysqlConnectOff, mysqlConnectData, MySQLOperaProcess};