import { MongoClient, ObjectId } from "mongodb"
import dayjs from "dayjs"
import dotenv from "dotenv"
import joi from "joi"

dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);
var db;
mongoClient.connect().then(db = mongoClient.db());

export function postPoll(req, res){
    const body = req.body;
    const title = body.title;
    let expireAt = body.expireAt;
    const joiTitle = joi.string();
    const { error, value } = joiTitle.validate(title);
    if (error == null){
        function salvaDB(){
            const newObject = {title: title, expireAt: expireAt};
            db.collection("Polls").insertOne(newObject)
                .then(continua => {
                    db.collection("Polls").findOne(newObject)
                        .then(resposta => {
                            res.send(resposta).status(201).end();
                        })
                        .catch(err => console.log(err.message));
                })
                .catch(err => console.log(err.message));
        }
        if (expireAt == null || expireAt == ""){
            expireAt = dayjs().add(30, "day").format("YYYY-MM-DD HH:mm");
            salvaDB();
        }
        else{
            salvaDB();
        }
    }
    else{
        res.status(422).end();
    }
}

export function getPoll(req, res){
    db.collection("Polls").find().toArray()
        .then(resposta => {
            res.send(resposta).end();
        })
        .catch(err => console.log(err.message));
}

export function getPollChoice(req, res){
    db.collection("Choices").find({ pollId: req.params.id }).toArray()
        .then(list => {
            if (list != null && list != []){
                res.send(list).end();
            }
            else{
                res.status(404).end();
            }
        })
        .catch(err => console.log(err.message));
}

export function getPollResult(req, res){
    db.collection("Choices").find({ pollId: req.params.id }).toArray()
        .then(choices => {
            let biggest = {votes: 0, title: ""};
            for (let a = 0; a < choices.length; a++){
                db.collection("Votes").find({ choiceId: choices[a]._id.toString() }).toArray()
                    .then(votes => {
                        if (votes.length > biggest.votes){
                            biggest.votes = votes.length;
                            biggest.title = choices[a].title;
                        }
                    })
                    .catch(err => console.log(err.message));
            }
            db.collection("Polls").findOne({ _id: new ObjectId(req.params.id) })
                .then(poll => {
                    let resultObject = {title: biggest.title, votes: biggest.votes};
                    const object = {_id: poll._id.toString(), title: poll.title, expireAt: poll.expireAt, result: [resultObject]};
                    res.send(object).end();
                })
                .catch(err => console.log(err.message));
        })
        .catch(err => console.log(err.message));
}