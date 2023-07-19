export function postPoll(req, res){
    // Valida o title e atribui o valor de expiredAt se necessário
    // IF : se não tiver erro, salvar e retornar a enquete
}

export function getPoll(req, res){
    // Encontra as enquetes no DB e retorna
}

export function getPollChoice(req, res){
    // Verifica a existência da enquete
    // retorna erro ou a enquete
}

export function getPollResult(req, res){
    // Pesquisa as opções no DB e pega a com maior voto, retornando-a ao usuário
}