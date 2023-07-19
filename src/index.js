import express from 'express'
import cors from 'cors'
import { getPoll, postPoll, getPollChoice, getPollResult } from "./controllers/controlPoll.js"
import { postChoice, postChoiceVote } from "./controllers/controlChoice.js"

const app = express()
app.use(express.json())
app.use(cors())

app.get("/poll", getPoll);

app.post("/poll", postPoll);

app.post("/choice", postChoice);

app.get("/poll/:id/choice", getPollChoice);

app.post("/choice/:id/vote", postChoiceVote);

app.get("/poll/:id/result", getPollResult);


const PORT = 5000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`))