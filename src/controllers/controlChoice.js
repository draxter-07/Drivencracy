import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"
import joi from "joi"
import dayjs from "dayjs"

dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);
var db;
mongoClient.connect().then(db = mongoClient.db());

export function postChoice(req, res){
    const body = req.body;
    const pollId = body.pollId;
    const title = body.title;
    const joiTitle = joi.string();
    const { error, value } = joiTitle.validate(title);
    if (error == null){
        db.collection("Polls").findOne({ _id: new ObjectId(pollId) })
            .then(resposta => {
                if (resposta != null){
                    if (dayjs() <= dayjs(resposta.expireAt)){
                        db.collection("Choices").find({ pollId: new ObjectId(pollId) }).toArray()
                            .then(choices => {
                                function salvaDB(){
                                    db.collection("Choices").insertOne(body)
                                        .then(continua => {
                                            db.collection("Choices").findOne(body)
                                                .then(choice => res.send(choice).status(201).end())
                                                .catch(err => console.log(err.message));
                                            })
                                        .catch(err => console.log(err.message));
                                }
                                if (choices.length != 0){
                                    for (let a = 0; a < choices.length; a++){
                                        if (choices[a].title == title){
                                            res.status(409).end();
                                        }
                                        else if (a == choices.length - 1 && choices[a].title != title){
                                            salvaDB()
                                        }
                                    }
                                }
                                else{
                                    salvaDB();
                                }
                            })
                            .catch(err => console.log(err.message));
                    }
                    else{
                        res.status(403).end()
                    }
                }
                else{
                    res.status(404).end();
                }
            })
            .catch(err => console.log(err.message));
    }
    else{
        res.status(422).end();
    }

}

export function postChoiceVote(req, res){
    db.collection("Choices").findOne({ _id: new ObjectId(req.params.id) })
        .then(choice => {
            if (choice != null){
                db.collection("Polls").findOne({ _id: new ObjectId(choice.pollId) })
                    .then(poll => {
                        if (dayjs() <= dayjs(poll.expireAt)){
                            const voteObject = {createdAt: dayjs().format("YYYY-MM-DD HH:mm"), choiceId: choice._id.toString()};
                            db.collection("Votes").insertOne(voteObject)
                                .then(final => res.status(201).end())
                                .catch(err => console.log(err.message));
                        }
                        else{res.status(403).end()};
                    })
                    .catch(err => console.log(err.message));
            }
            else{res.status(404).end()};
        })
        .catch(err => console.log(err.message));
}