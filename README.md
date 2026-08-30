# Site YP Cloud

Site da YP Cloud, startup de tecnologia de Florianópolis, com catálogo de
produtos e uma página dedicada ao DaVez.

HTML, CSS e JavaScript puros — sem build, sem dependências, sem framework.

## Rodar

```bash
npx serve -l 4322 .
```

Depois abra <http://localhost:4322>.

**Não use `python -m http.server` aqui.** Ele responde `200` com o arquivo
inteiro a requisições `Range`, em vez de `206 Partial Content` — e o hero
depende de `Range` para navegar pelo vídeo. Sem isso o navegador rebaixa os
9,3 MB a cada busca e a rolagem trava. Hospedagens estáticas (Vercel, Netlify,
Cloudflare, nginx, Apache) já respondem `Range` corretamente.

## Publicar

Sobe em qualquer hospedagem estática (Vercel, Netlify, Cloudflare Pages,
GitHub Pages, S3 ou hospedagem compartilhada comum). Não há etapa de build:
o que está aqui é o que vai para o ar.

```bash
npx vercel --prod
```

ou, na Netlify:

```bash
npx netlify deploy --prod --dir .
```

**Não precisa subir** (são de trabalho, não do site):

- `preview.html` — gerado, só para visualizar fora do servidor
- `build-preview.js` — o gerador do arquivo acima
- `assets/img/cidade-ypcloud-com-texto.bak.png` — a arte antes de o texto ser
  removido dela, guardada caso você queira voltar

Sem esses três o site fica em cerca de 12 MB, dos quais 9,3 MB são o vídeo.
Se o carregamento pesar, os caminhos são recomprimir o MP4 ou servi-lo por CDN.

### Antes de apontar o domínio

- [ ] Confirmar o e-mail em `index.html` (marcado com `TROCAR`)
- [ ] Trocar a URL canônica e o `og:image` nas duas páginas (marcados com `TROCAR`)
- [ ] Ligar o formulário a um endpoint (ver a seção do formulário abaixo)

## Arquivos

```
index.html                    Hero, especialidades, catálogo, como trabalhamos, contato
davez.html                    O DaVez — problema, como funciona, para quem é, perguntas
assets/css/style.css          Sistema visual inteiro, começando pelos tokens
assets/js/main.js             Hero, índice, scrollspy, revelação, fila, formulário
assets/video/cidade.mp4       Vídeo do hero (9,3 MB)
assets/img/cidade-ypcloud.png Arte que fecha o hero (1,9 MB)
assets/img/davez-painel.jpg   Foto do painel da loja, em destaque (111 KB)
assets/img/davez-app.jpg      Foto do app do entregador, em destaque (87 KB)
assets/img/telas/             As 12 capturas da galeria (1,2 MB no total)
assets/img/favicon.svg
build-preview.js      Gera preview.html (as duas páginas em um arquivo só)
preview.html          Gerado — para visualizar ou compartilhar sem hospedar
```

## As telas do DaVez são fotos, não desenho

`davez.html` mostrava uma fila desenhada em CSS, com nomes inventados. Agora
usa capturas do sistema rodando: `davez-app.jpg` (o lado do entregador) e
`davez-painel.jpg` (o lado da loja).

As capturas vieram de um ambiente com **loja e entregadores fictícios**
("Pizzaria Bella Massa"), não do sistema em produção — que tem nomes reais de
motoboys e das lojas atendidas. Nada nas imagens pertence a alguém real, e é
assim que deve continuar se forem trocadas.

Vieram em 3200×2000 e 1170×2532; foram reduzidas pela metade e salvas em JPEG
progressivo de qualidade 86, o que levou 2,8 MB a 111 KB sem perda visível.
A densidade ficou em 1,7× e 2,1× do tamanho renderizado, então continuam
nítidas em tela retina.

A seção `#por-dentro` traz as doze, separadas entre o painel da loja (sete) e
o aplicativo do entregador (cinco), cada uma com legenda do que faz.

**Duas coisas foram editadas nas capturas, e precisam ser refeitas se as telas
forem trocadas:**

- **O endereço no QR da loja foi borrado.** A captura mostrava
  `http://127.0.0.1:8090/...`, o endereço do ambiente de desenvolvimento —
  num site público isso denuncia que não é o sistema real. Quando houver
  domínio, vale recapturar em vez de borrar.
- **O texto gravado na arte do hero** já havia sido removido antes, por outro
  motivo (ver o histórico do `cidade-ypcloud.png`).

**Antes de trocar por telas novas:** confirme que os recursos que aparecem
estão em produção. As atuais mostram a aba Entrada e o botão "Devolver à fila",
que ainda não subiram — quem abrir o sistema hoje não vê os dois. A captura do
despacho automático mostra o modo **desligado**, e a legenda diz isso.

## As duas frentes

O site apresenta a YP Cloud fazendo **serviço e produto**: a seção
`#especialidades` lista sites, aplicativos, automação e sistemas sob medida;
`#produtos` traz o que a empresa construiu para si, hoje o DaVez.

Isso é uma decisão de posicionamento, não só de layout. Uma versão anterior
dizia "não fazemos desenvolvimento sob encomenda para terceiros" — o texto foi
reescrito quando as especialidades entraram, senão o site se contradiria.
Se um dia a empresa voltar a ser só de produto, o trecho a rever é o item
"Produto e projeto" em `#como`.

## Acrescentar um produto ao catálogo

O catálogo fica na seção `#produtos` do `index.html`. Para incluir um produto,
copie um bloco `<article class="produto">` inteiro e ajuste:

```html
<article class="produto">
  <div>
    <div class="produto__topo">
      <h3 class="produto__nome"><a href="pagina-do-produto.html">Nome</a></h3>
      <span class="estado estado--obra">Em construção</span>
    </div>
    <p class="produto__oque">A frase que explica o produto em uma linha.</p>
    <p>Dois ou três períodos sobre o que ele resolve.</p>
  </div>
  <dl class="produto__ficha">
    <div><dt>Tipo</dt><dd>Aplicativo</dd></div>
    <div><dt>Para quem</dt><dd>Quem é o usuário</dd></div>
    <div><dt>Onde roda</dt><dd>Celular e navegador</dd></div>
  </dl>
</article>
```

O estado é `estado--ativo` (No ar, fundo verde) ou `estado--obra`
(Em construção, contornado). O layout é uma lista de blocos largos, não uma
grade de cards: funciona bem com um produto e continua funcionando com seis.

Quando houver produtos suficientes, vale mover o catálogo para uma
`produtos.html` própria — a marcação já está pronta para ser recortada.

## Direção visual

O site abre com uma cena de vídeo e continua na mesma noite: fundo escuro,
coluna-índice à esquerda, conteúdo assimétrico à direita.

| | |
|---|---|
| Noite | `#07090F` — o mesmo fundo do hero, para o site continuar a cena |
| Superfícies | `#0D1119`, `#141A26` |
| Luz | `#EEF1F6` / `#97A1B4` / `#7A8497` |
| Acento | Azul `#4DA3FF`, o mesmo do logo |
| Semântica | Laranja `#FF9628` para "em rota" — a segunda cor do logo |
| Display | Fraunces, com o trecho-chave em itálico bold verde |
| Texto e rótulos | Karla |
| Favicon | `assets/img/favicon.svg` — três barras, a primeira é a da vez |
| Logo | `assets/img/logo-yp.svg`, 42px no rail e 38px no celular |

O Fraunces é variável e os eixos são usados de propósito: `opsz` alto nos
tamanhos grandes (contraste editorial entre traço fino e grosso) e baixo nos
pequenos, com `SOFT` leve para a serifa não ficar dura. O eixo `WONK` foi
testado e o Google Fonts não o serve nesta instância, então não é declarado.

Tudo passa por tokens no início do `style.css`. Para trocar o acento do site
inteiro, muda `--green` e mais nada.

O tema é escuro por decisão: não há variante clara e todas as cores são
pintadas explicitamente.

### O hero

`index.html` abre com uma seção `[data-hero]` de altura de tela. A rolagem move
o vídeo em vez da página, e a página só é liberada quando o vídeo termina e a
pessoa continua empurrando — depois volta a travar se ela retornar ao topo.
Os tempos ficam nos atributos: `data-distancia` (quanto de rolagem percorre o
vídeo inteiro) e `data-saida` (quanto ainda empurrar depois do fim para sair).

Três decisões não óbvias no `initHero`:

- **O salto de posição ignora `scroll-behavior: smooth`.** O site usa rolagem
  suave; se o reposicionamento do hero fosse animado, o re-travamento dispararia
  no meio da animação e puxaria a página de volta ao topo.
- **Antes de rolar, o layout é recalculado à força.** Com o `body` fixo o
  documento tem a altura da tela, e um salto para além dela seria cortado.
- **Sem vídeo, a arte final assume.** Erro de rede ou arquivo ausente disparam
  o estado final e liberam a página, em vez de deixar a pessoa presa numa tela
  preta. O loop de animação é interrompido junto, senão ele repintaria por cima.

## Nada de dado inventado

O site não traz número de operação, depoimento nem logo de cliente. Isso é
deliberado: para uma startup no começo, informação verdadeira e escassa
sustenta mais do que métrica de vaidade que ninguém pode conferir. A coluna da
abertura mostra onde a empresa fica, o que ela faz e o que está no ar hoje.

Quando existirem números e clientes reais para mostrar, os lugares naturais
são a coluna da abertura (`.figures`) e uma seção nova depois do catálogo.

### O logo é uma recomposição, não o arquivo oficial

`assets/img/logo-yp.svg` foi **redesenhado à mão** a partir de uma imagem do
logo, porque o arquivo original não estava disponível. É reconhecível e legível
até 24px, mas não é idêntico ao oficial.

Para colocar o arquivo de verdade, basta substituir o arquivo mantendo o nome:

```bash
cp /caminho/do/logo-oficial.svg "assets/img/logo-yp.svg"
```

Serve SVG (ideal) ou PNG — se for PNG, troque a extensão nas duas páginas e no
`build-preview.js`. O CSS já recorta em círculo e cuida dos tamanhos, então
nada mais precisa mudar. Depois rode `node build-preview.js` de novo.

Ainda por confirmar, marcado com `<!-- TROCAR: -->` no HTML:

- [ ] **Logo oficial** — substituir a recomposição descrita acima
- [ ] **E-mail de contato** — confirmar `contato@ypcloud.com.br`
- [ ] **URL canônica** e as imagens de compartilhamento (`og:image`, 1200×630)
- [ ] **Detalhes do DaVez** — a descrição do produto foi escrita a partir do
      conceito. Vale uma leitura de quem conhece o app para conferir se o
      fluxo das quatro etapas bate com o que ele faz de fato.

## Formulário de contato

Sem back-end configurado, o formulário abre o programa de e-mail do visitante
já preenchido. Para enviar de verdade, coloque a URL do serviço no atributo do
formulário em `index.html`:

```html
<form class="form" data-endpoint="https://formspree.io/f/SEU_ID">
```

O JavaScript já trata envio, sucesso e erro. Funciona com Formspree, Basin ou
qualquer endpoint que aceite `POST` de `FormData`.

## Decisões de robustez no JavaScript

Quatro escolhas que não são óbvias e existem por um motivo:

- **O conteúdo nunca fica invisível.** A classe `.reveal` só esconde sob
  `html.js`, marcada pelo próprio script, e há uma rede de segurança que revela
  tudo se o observer não reportar nada em 1,2 s. Sem JS, ou com o observer
  inerte, a página aparece inteira.
- **O scrollspy do índice mede a posição, não usa `requestAnimationFrame`
  como trava.** Um quadro que nunca chega deixaria o índice congelado para
  sempre; o controle é por tempo.
- **A fila de demonstração para quando a aba está oculta** (`document.hidden`)
  ou quando sai da tela, para não girar um `setInterval` à toa.
- **O hero tem saída pelo teclado.** Setas e PageUp/PageDown movem o vídeo,
  Home volta ao início e **End sai direto** — sem isso, o `body` fixo prenderia
  quem navega por teclado, que é falha de acessibilidade nível A.
- **As perguntas não têm animação de altura.** Uma transição em
  `::details-content` com `allow-discrete` chegou a prender o conteúdo em
  `block-size: 0` — a pergunta abria vazia. Um efeito cujo modo de falha é
  esconder texto não compensa.

## Acessibilidade

Verificado neste projeto:

- Todo texto passa em contraste AA sobre os três fundos usados
  (o menor par é `#7A8497` sobre `#141A26`, em 4.62:1)
- Alvos de toque com no mínimo 44px de altura no celular
- Um `h1` por página e hierarquia de títulos sem saltos
- Todos os campos do formulário com `label` associado
- Foco visível, link para pular ao conteúdo, `aria-expanded` no menu
- `prefers-reduced-motion` desliga as revelações e a rotação da fila

## Preview

```bash
node build-preview.js
```

Gera `preview.html` com as duas páginas embutidas em um arquivo só. Ele lê o
CSS e o JS reais, então não é uma segunda versão para manter à mão — rode de
novo depois de mexer no site.
