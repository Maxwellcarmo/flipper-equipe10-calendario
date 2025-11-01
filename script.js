function obterSemestreAtual() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const semestre = hoje.getMonth() < 6 ? 1 : 2;
  return { ano, semestre };
}

let eventos = {};

const nomesMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

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
          
          // [Carimbo, Mes, DataInicio, DataFim, Atividade, Tipo, Local, Curso, Observações, Nome]
          const [timestamp, mes, dataInicio, dataFim, atividade, tipo, local, curso, observacoes, nome] = valores;
          
          if (!mes || !dataInicio || !atividade) {
            console.log('Linha sem dados obrigatórios, pulando...');
            return;
          }
          
          const mesNum = parseInt(mes);
          if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
            console.log('Mês inválido:', mes);
            return;
          }
          
          if (!eventos[mesNum]) {
            eventos[mesNum] = [];
          }
          
          eventos[mesNum].push({
            diaInicio: parseInt(dataInicio),
            diaFim: dataFim ? parseInt(dataFim) : parseInt(dataInicio),
            titulo: atividade,
            tipo: (tipo || 'evento').toLowerCase(),
            local: local || '',
            curso: curso || '',
            observacoes: observacoes || '',
            responsavel: nome || ''
          });
        });
      }
      
      console.log('Eventos processados:', eventos);
      
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

  const eventosMes = eventos[mes] || [];
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
}

function gerarListaEventos(mes) {
  const container = document.getElementById("lista-eventos-container");
  container.innerHTML = "";

  const eventosMes = eventos[mes];
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
                     ev.tipo === "exame"   ? "🟠" :
                     "🔵";

    const item = document.createElement("li");
    let detalhes = [];
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