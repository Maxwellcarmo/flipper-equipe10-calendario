function obterSemestreAtual() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const semestre = hoje.getMonth() < 6 ? 1 : 2;
  return { ano, semestre };
}

const eventos = {
  7: [
    { diaInicio: 30, diaFim: 30, titulo: "Semana Acadêmica Coordenadores", tipo: "evento" },
    { diaInicio: 31, diaFim: 31, titulo: "Semana Acadêmica Professores", tipo: "evento" }
  ],
  8: [
    { diaInicio: 1, diaFim: 1, titulo: "Semana Acadêmica Professores", tipo: "evento" },
    { diaInicio: 1, diaFim: 1, titulo: "Inicio do Período Letívo", tipo: "evento" },
    { diaInicio: 4, diaFim: 4, titulo: "Inicio das Aulas", tipo: "aula" }
  ],
  9: [
    { diaInicio: 7, diaFim: 7, titulo: "Feriado - Independência do Brasil", tipo: "feriado" },
    { diaInicio: 22, diaFim: 26, titulo: "Avaliação Oficial - 1º Bimestre", tipo: "prova" }
  ],
  10: [
    { diaInicio: 3, diaFim: 3, titulo: "Realizar revisão de notas - 1º bimestre", tipo: "evento" },
    { diaInicio: 12, diaFim: 12, titulo: "Feriado - Nossa Sr.a Aparecida", tipo: "feriado" },
    { diaInicio: 13, diaFim: 13, titulo: "Recesso Escolar - Não haverá aula", tipo: "feriado" }
  ],
  11: [
    { diaInicio: 2, diaFim: 2, titulo: "Feriado - Finados", tipo: "feriado" },
    { diaInicio: 15, diaFim: 15, titulo: "Feriado - Proclamação da República", tipo: "feriado" },
    { diaInicio: 17, diaFim: 21, titulo: "Avaliação Oficial - 2º Bimestre", tipo: "prova" },
    { diaInicio: 17, diaFim: 29, titulo: "Avaliação Oficial DI - Disciplina Interativa", tipo: "prova" },
    { diaInicio: 20, diaFim: 20, titulo: "Feriado - Dia Nacional de Zumbi e da Consciência Negra", tipo: "feriado" },
     { diaInicio: 24, diaFim: 28, titulo: "Apresentação das Bancas de TCC", tipo: "evento" }
  ], 
  12: [
    { diaInicio: 1, diaFim: 3, titulo: "Avaliaçãode 2ª Chamada", tipo: "exame" },
    { diaInicio: 6, diaFim: 6, titulo: "Término das Aulas", tipo: "aula" },
    { diaInicio: 1, diaFim: 5, titulo: "Lançamento de Notas Oficial DI", tipo: "evento" },
    { diaInicio: 4, diaFim: 5, titulo: "Lançamento de Notas das Avaliações 2ª Chamada e Realizar revisão de Notas tardio", tipo: "evento" },
    { diaInicio: 8, diaFim: 10, titulo: "Exame Final", tipo: "exame" },
    { diaInicio: 11, diaFim: 12, titulo: "Lançamento das notas do Exame Final", tipo: "evento" },
    { diaInicio: 31, diaFim: 31, titulo: "Encerramento do Período Letivo", tipo: "aula" }
  ]
};

const nomesMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

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

  // Botão "Adicionar evento" agora é criado após o calendário ser gerado
  const addBtn = document.createElement('button');
  addBtn.className = 'button-event';
  addBtn.textContent = 'Adicionar evento';
  // Handler: abre o link em nova aba. Ajuste a URL abaixo conforme necessário.
  addBtn.setAttribute('aria-label', 'Abrir formulário em nova aba');
  addBtn.addEventListener('click', () => {
    const url = 'https://docs.google.com/forms/d/e/1FAIpQLSdEzJqvI-jjnn_331-Hd8EksZUsAOTgD2ob8rwPEeubQvD6Kg/viewform?usp=header';
    window.open(url, '_blank', 'noopener,noreferrer');
  });
  // Adiciona o botão dentro do container (após o grid)
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
    item.innerHTML = `<span>${corIcone}</span> <strong>${ev.diaInicio}/${mes}${fim}:</strong> ${ev.titulo}`;
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

// Inicializa com o mês atual ou fevereiro
const { ano } = obterSemestreAtual();
const mesAtual = new Date().getMonth() + 1;
document.querySelector(`.mes-btn[data-mes='${mesAtual}']`)?.click();