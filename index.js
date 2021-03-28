const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const JWTSecret = "secret";

app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use(express.json());

var contId = 3;
var DB = {
    games: [
        {
            id: 0,
            title: "Call of Duty MW",
            year: 2019,
            price: 100
        },
        {
            id: 1,
            title: "Mortal Kombat",
            year: 2017,
            price: 60
        },
        {
            id: 2,
            title: "Resident Evil 4",
            year: 2005,
            price: 40
        }
    ],
    users: [
        {
            id: 0,
            name: "root",
            email: "root@localhost",
            password: "root"
        },
        {
            id: 1,
            name: "kassuelo",
            email: "kassuelo@localhost",
            password: "kassuelo"
        }
    ]
}

function authUser(req, res, next){
    const authToken = req.headers['authorization'];
    if(authToken != undefined){
        const bearer = authToken.split(" ");
        var token = bearer[1];
        jwt.verify(token, JWTSecret,(err,data) => {
            if(err){
                res.status(401).json({err: "token inválido"})
            }else{
                req.token = token;
                req.loggedUser = {id: data.id, email: data.email};
                next();
            }
        });
    }else{
        res.status(401).json({err:"token inválido"});
    }
}

app.post("/auth", (req,res) => {
    var {email,password} = req.body;
    if(email != undefined){
        var user = DB.users.find(user => user.email == email);
        if(user != undefined){
            if(user.password == password){
                jwt.sign({id: user.id, email: user.email}, JWTSecret, {expiresIn:'48h'},(err,token) => {
                    if(err){
                       res.status(401).json({err:"falha interna"});
                    }else{
                       res.status(200).json({token:token});
                    }
                
                });

            }else{
                res.status(401).json({err: "credenciais inválidas."});
            }
        }else{
            res.status(404).json({err:"o email não existe na base de dados."});
        }
    }else{
        res.status(400).json({err: "email inválido."});
    }
});

app.get("/games",authUser, (req, res) => {
    res.status(200).json(DB.games);
});

app.post("/game",authUser, (req, res) => {   
    var {title, price, year} = req.body;
    DB.games.push({
        id: contId,
        title,
        price,
        year
    });
    contId++;
    res.sendStatus(201); 

});

app.delete("/game/:id",authUser, (req,res) =>{
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);
        var index = DB.games.findIndex(g => g.id == id);
        if(index == -1){
            res.sendStatus(404);
        }else{
            DB.games.splice(index,1);
            res.sendStatus(204);
        }
    }
});

app.get("/game/:id",authUser, (req,res) =>{

    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);
        var game = DB.games.find(g => g.id == id);
        if(game != undefined){
            res.status(200).json(game);
        }else{
            res.sendStatus(404);
        }
    }
});

app.put("/game/:id",authUser, (req,res) =>{

    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);
        var game = DB.games.find(g => g.id == id);
        if(game != undefined){
            var {title, price, year} = req.body;
            if(title != undefined){
                game.title = title;
            }
            if(price != undefined){
                game.price = price;
            } 
            if(year != undefined){
                game.year = year;
            }
            res.sendStatus(200);
        }else{
            res.sendStatus(404);
        }
    }
});

app.listen(45678, () => {
    console.log("API RODANDO!");
});