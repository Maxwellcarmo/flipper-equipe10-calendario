function obterSemestreAtual() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const semestre = hoje.getMonth() < 6 ? 1 : 2;
  return { ano, semestre };
}

// Cria UI de filtros (botão + dropdown com checkboxes)
function criarUIFiltros() {
  const container = document.getElementById('calendario-container');
  if (!container) return;

  // Se já existe, apenas atualiza as opções
  let filtroWrapper = document.getElementById('filtros-wrapper');
  if (!filtroWrapper) {
    filtroWrapper = document.createElement('div');
    filtroWrapper.id = 'filtros-wrapper';
    filtroWrapper.className = 'filtros-wrapper';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'filtro-toggle';
  // Não reutilizamos a classe `button-event` para evitar conflito de posicionamento
  btn.className = 'filtro-btn';
    btn.textContent = 'Filtrar';
    btn.addEventListener('click', () => {
      dropdown.classList.toggle('show');
    });

    const dropdown = document.createElement('div');
    dropdown.id = 'filtro-dropdown';
    dropdown.className = 'filtro-dropdown';

    // Sections for tipos and cursos
    const sectionTipos = document.createElement('div');
    sectionTipos.className = 'filtro-section';
    const hTipos = document.createElement('strong');
    hTipos.textContent = 'Tipo';
    sectionTipos.appendChild(hTipos);

    const sectionCursos = document.createElement('div');
    sectionCursos.className = 'filtro-section';
    const hCursos = document.createElement('strong');
    hCursos.textContent = 'Curso';
    sectionCursos.appendChild(hCursos);

    const actions = document.createElement('div');
    actions.className = 'filtro-actions';
    const aplicar = document.createElement('button');
    aplicar.textContent = 'Aplicar';
    aplicar.className = 'filtro-aplicar';
    aplicar.addEventListener('click', () => {
      dropdown.classList.remove('show');
      aplicarFiltros();
    });
    const limpar = document.createElement('button');
    limpar.textContent = 'Limpar';
    limpar.className = 'filtro-limpar';
    limpar.addEventListener('click', () => {
      // desmarca tudo
      dropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      aplicarFiltros();
    });
    actions.appendChild(aplicar);
    actions.appendChild(limpar);

    dropdown.appendChild(sectionTipos);
    dropdown.appendChild(sectionCursos);
    dropdown.appendChild(actions);

    filtroWrapper.appendChild(btn);
    filtroWrapper.appendChild(dropdown);

    // Insere antes do botão de adicionar evento (se existir)
    container.appendChild(filtroWrapper);
  }

  // Preenche opções (atualiza os containers)
  const dropdownEl = document.getElementById('filtro-dropdown');
  if (!dropdownEl) return;
  const tiposContainer = dropdownEl.querySelector('.filtro-section:nth-of-type(1)');
  const cursosContainer = dropdownEl.querySelector('.filtro-section:nth-of-type(2)');

  // Limpa (mantém o título como primeiro child)
  while (tiposContainer.childElementCount > 1) tiposContainer.removeChild(tiposContainer.lastChild);
  while (cursosContainer.childElementCount > 1) cursosContainer.removeChild(cursosContainer.lastChild);

  filtrosDisponiveis.tipos.forEach(tipo => {
    const id = `f_tipo_${tipo}`;
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" id="${id}" name="tipo" value="${tipo}"> ${tipo}`;
    tiposContainer.appendChild(label);
  });

  filtrosDisponiveis.cursos.forEach(curso => {
    const id = `f_curso_${curso}`.replace(/\s+/g, '_');
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" id="${id}" name="curso" value="${curso}"> ${curso}`;
    cursosContainer.appendChild(label);
  });
}



function aplicarFiltros() { aplicarFiltrosImpl(); }

function aplicarFiltrosImpl() {
  const dropdown = document.getElementById('filtro-dropdown');
  if (!dropdown) return;
  const tiposSel = Array.from(dropdown.querySelectorAll('input[name="tipo"]:checked')).map(i => i.value.toLowerCase());
  const cursosSel = Array.from(dropdown.querySelectorAll('input[name="curso"]:checked')).map(i => i.value);

  if (tiposSel.length === 0 && cursosSel.length === 0) {
    eventosFiltrados = JSON.parse(JSON.stringify(eventos));
    const mesAtual = new Date().getMonth() + 1;
    document.querySelector(`.mes-btn[data-mes='${mesAtual}']`)?.click();
    return;
  }

  const novo = {};
  Object.keys(eventos).forEach(mes => {
    const lista = eventos[mes].filter(ev => {
      const tipoOk = tiposSel.length === 0 || tiposSel.includes((ev.tipo || '').toLowerCase());
      const cursoOk = cursosSel.length === 0 || (ev.curso && cursosSel.includes(ev.curso));
      return tipoOk && cursoOk;
    });
    if (lista.length) novo[mes] = lista;
  });

  eventosFiltrados = novo;
  const mesAtual = new Date().getMonth() + 1;
  document.querySelector(`.mes-btn[data-mes='${mesAtual}']`)?.click();
}

let eventos = {};
let eventosFiltrados = {};
let filtrosDisponiveis = { tipos: [], cursos: [] };

const nomesMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Remove zeros à esquerda e converte para inteiro (aceita "01" -> 1)
function limparNumero(valor) {
  if (valor === null || valor === undefined) return null;
  const s = String(valor).trim();
  if (s === '') return null;
  const noLeading = s.replace(/^0+/, '');
  return noLeading === '' ? 0 : parseInt(noLeading, 10);
}

async function carregarEventos() {
  const SPREADSHEET_ID = '1LMCZvmkB2gn3sGQQj5ZDtEIqPVGygpzZ9S53PF2LUfM';
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;

  try {
    console.log('Tentando carregar eventos da planilha...');
    console.log('URL:', url);
    
    const response = await fetch(url);
    console.log('Status da resposta:', response.status);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP! status: ${response.status}`);
    }
    
    const text = await response.text();
    // Remove o prefixo e sufixo do JSON
    const jsonData = text.substr(47).slice(0, -2);
    
    try {
      const data = JSON.parse(jsonData);
      console.log('Dados parseados:', data);
      eventos = {};
      
      if (data.table && data.table.rows) {
        data.table.rows.forEach((row, index) => {
          if (index === 0) return; // Pula o cabeçalho
          if (!row.c) return;
          
          const valores = row.c.map(cell => cell ? (cell.v || '') : '');
          console.log('Valores da linha:', valores);
          
          // [Carimbo, Mes, DataInicio, DataFim, Titulo, Tipo, Local, Curso, Observações, Nome]
          const [timestamp, mes, dataInicio, dataFim, titulo, tipo, local, curso, observacoes, nome] = valores;
          
          if (!mes || !dataInicio || !titulo) {
            console.log('Linha sem dados obrigatórios, pulando...');
            return;
          }
          
          const mesNum = limparNumero(mes);
          if (!mesNum || mesNum < 1 || mesNum > 12) {
            console.log('Mês inválido:', mes);
            return;
          }
          
          if (!eventos[mesNum]) {
            eventos[mesNum] = [];
          }
          
          eventos[mesNum].push({
            diaInicio: limparNumero(dataInicio),
            diaFim: dataFim ? limparNumero(dataFim) : limparNumero(dataInicio),
            titulo: titulo,
            tipo: (tipo || 'evento').toLowerCase(),
            local: local || '',
            curso: curso || '',
            observacoes: observacoes || '',
            responsavel: nome || ''
          });
        });
      }
      
      console.log('Eventos processados:', eventos);
      // Inicializa eventosFiltrados como cópia completa
      eventosFiltrados = JSON.parse(JSON.stringify(eventos));

      // Monta listas únicas de tipos e cursos para os filtros
      const tiposSet = new Set();
      const cursosSet = new Set();
      Object.values(eventos).forEach(lista => {
        lista.forEach(ev => {
          if (ev.tipo) tiposSet.add(ev.tipo.toLowerCase());
          if (ev.curso) cursosSet.add(ev.curso);
        });
      });
  filtrosDisponiveis.tipos = Array.from(tiposSet);
  filtrosDisponiveis.cursos = Array.from(cursosSet);
      
      // Após carregar os eventos, atualizar o calendário
      const mesAtual = new Date().getMonth() + 1;
      document.querySelector(`.mes-btn[data-mes='${mesAtual}']`)?.click();
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError);
      throw parseError;
    }
  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
  }
}

function gerarCalendario(mes, ano) {
  const container = document.getElementById("calendario-container");
  container.innerHTML = "";

  const titulo = document.createElement("h3");
  titulo.innerHTML = `${ano}/${mes < 7 ? 1 : 2} - ${nomesMeses[mes - 1]}`;
  titulo.classList.add("section-title");
  container.appendChild(titulo);

  const grid = document.createElement("div");
  grid.className = "calendario-grid";

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  diasSemana.forEach(dia => {
    const div = document.createElement("div");
    div.className = "dia-cabecalho";
    div.textContent = dia;
    grid.appendChild(div);
  });

  const primeiroDia = new Date(ano, mes - 1, 1).getDay();
  const diasNoMes = new Date(ano, mes, 0).getDate();

  const eventosMes = eventosFiltrados[mes] || [];
  const mapaEventos = {};
  eventosMes.forEach(ev => {
    for (let d = ev.diaInicio; d <= ev.diaFim; d++) {
      mapaEventos[d] = mapaEventos[d] || [];
      mapaEventos[d].push(ev);
    }
  });

  for (let i = 0; i < primeiroDia; i++) {
    const vazio = document.createElement("div");
    vazio.className = "dia";
    grid.appendChild(vazio);
  }

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const div = document.createElement("div");
    div.className = "dia";
    if (mapaEventos[dia]) {
      const tipos = mapaEventos[dia].map(e => e.tipo);
      if (tipos.length > 0) {
        div.classList.add(`evento-${tipos[0]}`);
      }
    }
    div.textContent = dia;
    grid.appendChild(div);
  }

  container.appendChild(grid);

  const addBtn = document.createElement('button');
  addBtn.className = 'button-event';
  addBtn.textContent = 'Adicionar evento';
  addBtn.setAttribute('aria-label', 'Abrir formulário em nova aba');
  addBtn.addEventListener('click', () => {
    const url = 'https://docs.google.com/forms/d/e/1FAIpQLSdEzJqvI-jjnn_331-Hd8EksZUsAOTgD2ob8rwPEeubQvD6Kg/viewform?usp=header';
    window.open(url, '_blank', 'noopener,noreferrer');
  });
  container.appendChild(addBtn);
  // (Re)cria/atualiza a UI de filtros depois que o container foi montado
  criarUIFiltros();
}

function gerarListaEventos(mes) {
  const container = document.getElementById("lista-eventos-container");
  container.innerHTML = "";

  const eventosMes = eventosFiltrados[mes];
  if (!eventosMes || eventosMes.length === 0) return;

  const bloco = document.createElement("div");
  bloco.className = "eventos-mes";

  const titulo = document.createElement("h3");
  titulo.textContent = `📌 Eventos de ${nomesMeses[mes - 1]}`;
  bloco.appendChild(titulo);

  const lista = document.createElement("ul");
  eventosMes.forEach(ev => {
    const fim = ev.diaFim !== ev.diaInicio ? ` a ${ev.diaFim}` : "";
    const corIcone = ev.tipo === "feriado" ? "🔴" :
                     ev.tipo === "aula"    ? "🟢" :
                     ev.tipo === "prova"   ? "🟡" :
                     ev.tipo === "trabalho"   ? "🟠" :
                     ev.tipo === "palestra"? "🟣" :
                     "🔵";

    const item = document.createElement("li");
    let detalhes = [];
    
    // Adiciona o tipo do evento como primeiro detalhe
    const tipoFormatado = ev.tipo.charAt(0).toUpperCase() + ev.tipo.slice(1); // Capitaliza a primeira letra
    detalhes.push(`Tipo: ${tipoFormatado}`);
    
    if (ev.local) detalhes.push(`Local: ${ev.local}`);
    if (ev.curso) detalhes.push(`Curso: ${ev.curso}`);
    if (ev.responsavel) detalhes.push(`Responsável: ${ev.responsavel}`);
    if (ev.observacoes) detalhes.push(`Obs: ${ev.observacoes}`);
    
    const detalhesTexto = detalhes.length > 0 ? `<br><small>${detalhes.join(' | ')}</small>` : '';
    
    item.innerHTML = `<span>${corIcone}</span> <strong>${ev.diaInicio}/${mes}${fim}:</strong> ${ev.titulo}${detalhesTexto}`;
    lista.appendChild(item);
  });

  bloco.appendChild(lista);
  container.appendChild(bloco);
}

// Interação nos botões de mês
document.querySelectorAll(".mes-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mes-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const mesSelecionado = parseInt(btn.getAttribute("data-mes"));
    const { ano } = obterSemestreAtual();
    gerarCalendario(mesSelecionado, ano);
    gerarListaEventos(mesSelecionado);
  });
});

// Carrega os eventos e inicializa o calendário
carregarEventos();