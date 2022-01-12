# RastroJs
Uma biblioteca Nodejs para rastreamento de encomendas nos Correios.

*Este projeto não é oficial dos Correios e apesar de se alimentar de um sistema web legítimo dos Correios este não realiza integrações com o webservice dos Correios.*

![](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![](https://img.shields.io/npm/l/rastrojs?color=blue&label=License)

![](https://img.shields.io/npm/dm/rastrojs?label=Downloads&logo=npm)
![](https://img.shields.io/github/issues/talesluna/rastrojs?color=red&label=Issues&logo=github&logoColor=white)
![](https://img.shields.io/github/stars/talesluna/rastrojs?color=yellow&label=Stars&logo=github)
---

[Instalação](#install) - [Exemplos](#examples) - [Respostas](#response) - [Contribuição](#contribution) - [Licença](#license)

----

## Install

```sh
npm install --save rastrojs
```

## Examples

```ts
import rastrojs, { RastroJS, Tracking } from 'rastrojs';

// By function
const tracksA = await rastrojs.track('JT124720455BR');
const tracksB = await rastrojs.track(['JT124720455BR', '123']);
const tracksC = await rastrojs.track('JT124720455BR', 'JT124720455BC', '123');


// Using classes
class MyDeliveries extends RastroJS {

    constructor(private codes: string[]) {
        super();
    }

    public get tracks(): Promise<Tracking[]> {
        return this.track(this.codes);
    }

}

const myDeliveries = new MyDeliveries(['JT124720455BR', 'JT124720455BC', '123']);
const tracks = await myDeliveries.tracks;

```

> Para TypeScript, certifique-se de incluir "rastrojs" em "types" no tsconfig.json do seu projeto

## Response

### Fields
|Field|Type|Description|Exemple
|-|-|-|-|
|code|String|Código do objeto pesquisado|JT124720455BR
|type|String|Tipo de enconenda segundo os Correios|Registrado Urgente
|isDelivered|Boolean|Flag de entrega|true/false
|postedAt|Date|Data da postagem do objeto|2021-12-22T21:15:00.000Z
|updatedAt|Date|Data da última atualização do objeto|2022-01-07T17:18:00.000Z
|tracks|Array| Lista de eventos registrados do objeto|-
|tracks.locale|String|Local do evento|São Paulo / SP
|tracks.status|String|Status do objeto segundo dos correios|Objeto postado
|tracks.observation|String|Observações do evento registrado|De unidade X para ...
|tracks.trackedAt|Date|Data do evento registrado|2022-01-03T14:26:00.000Z
|error?|String|Mensagem de erro possível|service_unavailable*
|isInvalid?|Boolean|Flag de resposta não esperada (erro)|true*

> *. isInvalid e error só existem em casos de respostas de erro.

```js
[
    {
        code: 'JT124720455BR',
        type: 'registrado urgente',
        isDelivered: true,
        postedAt: 2021-12-22T21:15:00.000Z,
        updatedAt: 2022-01-07T17:18:00.000Z,
        tracks: [
            /* ... */
            {
                locale: 'sao paulo / sp',
                status: 'objeto entregue ao destinatário',
                observation: null,
                trackedAt: 2022-01-07T17:18:00.000Z
            }
        ]
    },
    {
        code: 'JT124720455CH',
        error: 'not_found',
        isInvalid: true,
    },
    {
        code: 'JT124720455FR',
        error: 'service_unavailable',
        isInvalid: true,
    }
]
```

### Errors
|Erro|Description
|-|-|
|invalid_code|O código informado não corresponde ao formato dos correios.
|not_found|A encomenda não foi encontrada no serviços dos correios
|service_unavailable|O serviço web dos correios estava indisponível no momento
|internal_server_error|Ocorreu um erro interno no serviço web dos correios


## Contribution

Veja como em: [CONTRIBUTING.md](./CONTRIBUTING.md) - Qualquer dúvida ou sugestão: tales.ferreira.luna@gmail.com

## License

RastroJS é totalmente aberta e está sob licença [MIT](./LICENSE), use a vontade.
