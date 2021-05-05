# RastroJS

Uma biblioteca JavaScript para rastreamento de encomendas nos Correios.


- [Instalação](#instalação)
- [Exemplos](#exemplos)
    - [Básico](#exemplo-básico)
    - [Com TypeScript](#exemplo-com-typescript)
- [Contribuição](#contribuição)
- [Licença](#licença)


## Instalação
```sh
npm install --save rastrojs
```

## Exemplos

### Exemplo Básico

```js
const rastrojs = require('rastrojs');

async function example() {

    const tracks = await rastrojs.track('JT124720455BR', 'NOT-CODE', 'AA124720455US');

    console.log(tracks);

};

example();

```

### Exemplo com TypeScript

> Certifique-se de incluir "rastrojs" em "types" no tsconfig.json do seu projeto

```typescript
import rastrojs, { RastroJS, Tracking } from 'rastrojs';


// Funções
async function getObjects() {

    const tracks1 = await rastrojs.track('JT124720455BR');
    const tracks2 = await rastrojs.track(['JT124720455BR', '123']);
    const tracks3 = await rastrojs.track('JT124720455BR', 'JT124720455BC', '123');

    console.log(tracks1, tracks2, tracks3);

}

getObjects();


// Classes
class Example extends RastroJS {

    constructor(private codes: string[]) {
        super();
    }

    public get tracks(): Promise<Tracking[]> {
        return this.track(this.codes);
    }

}

const example = new Example(['JT124720455BR', 'JT124720455BC', '123']);

example
    .tracks
    .then(tracks => console.log(tracks));
```

## Contribuição

Veja como em: [CONTRIBUTING.md](./CONTRIBUTING.md)

> Qualquer dúvida ou sugestão: tales.ferreira.luna@gmail.com

## Licença

RastroJS é totalmente aberta e está sob licença [MIT](./LICENSE), use a vontade.
