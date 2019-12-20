var app = require("express")();
var express = require("express");

app.use(express.static(__dirname + '/public'));

var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function(req,res){
    res.sendFile(__dirname + "/index.html");
})

var mySocket;
const porta = "COM6";

const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const port = new SerialPort(porta)

const parser = port.pipe(new Readline({ delimiter: '\r\n' }))

const fs = require('fs');

parser.on('data', function(data){
    let infoBroke = data.split(',');

    let temperatuda = infoBroke[2];
    let pressao = infoBroke[3];
    let altitude = infoBroke[4];
    let umidade = infoBroke[5];

    let date = new Date();
    let hora = date.getHours().toString().length==2?date.getHours():"0"+date.getHours();
    let minutos = date.getMinutes().toString().length==2?date.getMinutes():"0"+date.getMinutes();
    let segundos = date.getSeconds().toString().length==2?date.getSeconds():"0"+date.getSeconds();
    let horarioAtual = hora + ":" + minutos + ":" + segundos;

    let info = horarioAtual+","+umidade+","+pressao+","+altitude+","+temperatuda;
    
    if(info.length == 36){
        fs.writeFile('resultados.txt', info+"\n",{flag: 'a'}, function(err){
            if(err)throw err;
            console.log(info);
        });

        io.emit("dadoArduino",{
            valor: info
        });
    }
})

io.on('conection', function(socket){
    fs.readFile('resultados.txt','utf-8', function(err, data){
        if(err) throw err;
        io.emit('dadoArduino', {
            valor: data
        })
    });
})

http.listen(3000, function(){
    console.log('Servidor aberto na porta 3000');
})