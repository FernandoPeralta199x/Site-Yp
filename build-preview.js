/**
 * Gera um arquivo único de preview a partir das páginas do site.
 *
 * Cada página vira um iframe com todo o CSS e o JS embutidos, então o
 * preview roda exatamente o mesmo código do site — não é uma segunda versão
 * mantida à mão. Rode de novo depois de mexer no site:
 *
 *   node build-preview.js
 */
const fs = require('fs');
const path = require('path');

const raiz = __dirname;
const css = fs.readFileSync(path.join(raiz, 'assets/css/style.css'), 'utf8');
const js = fs.readFileSync(path.join(raiz, 'assets/js/main.js'), 'utf8');

// O preview precisa ser um arquivo único: a imagem vira data URI, senão o
// caminho relativo quebra quando o arquivo sai da pasta do site.
const logo = fs.readFileSync(path.join(raiz, 'assets/img/logo-yp.svg'), 'utf8');
const logoDataUri = 'data:image/svg+xml;base64,' + Buffer.from(logo, 'utf8').toString('base64');

// A arte final do hero também entra embutida. O vídeo (9,3 MB) fica de fora
// de propósito: em base64 passaria do limite do preview. Sem ele o hero
// detecta a falha e mostra direto a arte, que é o estado final da cena.
const arte = fs.readFileSync(path.join(raiz, 'assets/img/cidade-ypcloud.png'));
const arteDataUri = 'data:image/png;base64,' + arte.toString('base64');

// As telas do produto também entram embutidas — são leves depois da
// compressão e sem elas a página do DaVez fica sem as fotos no preview.
const telas = ['davez-painel.jpg', 'davez-app.jpg'].map(function (nome) {
  const bin = fs.readFileSync(path.join(raiz, 'assets/img/' + nome));
  return { nome: 'assets/img/' + nome, uri: 'data:image/jpeg;base64,' + bin.toString('base64') };
});

// A galeria inteira também: são doze arquivos, mas leves depois da compressão.
const pastaTelas = path.join(raiz, 'assets/img/telas');
for (const nome of fs.readdirSync(pastaTelas).filter(function (n) { return n.endsWith('.jpg'); })) {
  const bin = fs.readFileSync(path.join(pastaTelas, nome));
  telas.push({ nome: 'assets/img/telas/' + nome, uri: 'data:image/jpeg;base64,' + bin.toString('base64') });
}

const paginas = [
  { arquivo: 'index.html', id: 'home', rotulo: 'Home' },
  { arquivo: 'davez.html', id: 'davez', rotulo: 'DaVez' }
];

/** Substitui os links para arquivos externos pelo conteúdo embutido. */
function embutir(entrada) {
  let html = entrada
    .replace(
      /<link rel="stylesheet" href="assets\/css\/style\.css">/,
      '<style>\n' + css + '\n</style>'
    )
    .replace(
      /<script src="assets\/js\/main\.js"><\/script>/,
      '<script>\n' + js + '\n</script>'
    )
    .split('assets/img/logo-yp.svg').join(logoDataUri)
    .split('assets/img/cidade-ypcloud.png').join(arteDataUri);

  for (const t of telas) html = html.split(t.nome).join(t.uri);
  return html;
}

const docs = paginas.map(function (p) {
  const html = embutir(fs.readFileSync(path.join(raiz, p.arquivo), 'utf8'));
  return Object.assign({}, p, {
    // srcdoc é um valor de atributo: só as aspas duplas precisam escapar.
    srcdoc: html.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  });
});

const abas = docs
  .map(function (d, i) {
    return (
      '<button class="tab' + (i === 0 ? ' is-active' : '') + '" data-alvo="' + d.id + '" type="button">' +
      d.rotulo +
      '</button>'
    );
  })
  .join('\n      ');

const frames = docs
  .map(function (d, i) {
    return (
      '<iframe class="frame' + (i === 0 ? ' is-active' : '') + '" id="frame-' + d.id +
      '" title="' + d.rotulo + '" srcdoc="' + d.srcdoc + '"></iframe>'
    );
  })
  .join('\n    ');

// O conteúdo de srcdoc é parseado com o encoding do documento pai, então a
// declaração precisa estar aqui — o meta dentro de cada página não basta.
const saida = `<meta charset="utf-8">
<title>Site YP Cloud</title>
<style>
  :root { color-scheme: dark; }
  body {
    margin: 0;
    background: #07090F;
    font-family: "Karla", ui-sans-serif, system-ui, sans-serif;
    display: flex; flex-direction: column; height: 100vh;
  }
  .barra {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px;
    background: #0D1119;
    border-bottom: 1px solid rgba(151,161,180,0.20);
    flex: none;
  }
  .barra strong {
    font-size: 12px; letter-spacing: .14em; text-transform: uppercase;
    color: #97A1B4; font-weight: 700; margin-right: 6px;
  }
  .tab {
    font: inherit; font-size: 13px;
    background: transparent; color: #EEF1F6;
    border: 1px solid rgba(151,161,180,0.34); border-radius: 0;
    padding: 8px 16px; cursor: pointer;
    transition: background-color .2s, border-color .2s, color .2s;
  }
  .tab:hover { border-color: #4DA3FF; }
  .tab.is-active { background: #4DA3FF; border-color: #4DA3FF; color: #06121F; }
  .tab:focus-visible { outline: 2px solid #4DA3FF; outline-offset: 2px; }
  .palco { position: relative; flex: 1; min-height: 0; }
  .frame {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    border: 0; display: none; background: #07090F;
  }
  .frame.is-active { display: block; }
</style>

<div class="barra">
  <strong>YP Cloud</strong>
  ${abas}
</div>

<div class="palco">
  ${frames}
</div>

<script>
  document.querySelectorAll('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('is-active'); });
      document.querySelectorAll('.frame').forEach(function (f) { f.classList.remove('is-active'); });
      tab.classList.add('is-active');
      document.getElementById('frame-' + tab.dataset.alvo).classList.add('is-active');
    });
  });
</script>
`;

const destino = process.argv[2] || path.join(raiz, 'preview.html');
fs.writeFileSync(destino, saida, 'utf8');
console.log('Preview gerado em ' + destino + ' (' + Math.round(saida.length / 1024) + ' KB)');
