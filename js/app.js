function limpar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const busca = document.getElementById("busca");

if (busca) {
    const linhas = document.querySelectorAll("tbody tr");

    busca.addEventListener("input", function () {
        const termo = limpar(busca.value.trim());
        const termoNumeros = termo.replace(/\D/g, "");

        linhas.forEach(function (linha) {
            const nome = limpar(linha.cells[0].textContent);
            const cpf = linha.cells[1].textContent;
            const cpfNumeros = cpf.replace(/\D/g, "");

            const achou =
                nome.includes(termo) ||
                cpf.includes(termo) ||
                (termoNumeros !== "" && cpfNumeros.includes(termoNumeros));

            linha.style.display = achou ? "" : "none";
        });
    });
}

// cadastro de paciente
const formPaciente = document.getElementById("form-paciente");

if (formPaciente) {
    formPaciente.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const paciente = {
            nome: document.getElementById("nome").value.trim(),
            cpf: document.getElementById("cpf").value.trim(),
            telefone: document.getElementById("telefone").value.trim()
        };

        const lista = JSON.parse(localStorage.getItem("pacientes")) || [];
        lista.push(paciente);
        localStorage.setItem("pacientes", JSON.stringify(lista));

        window.location.href = "pacientes.html";
    });
}

const corpoTabela = document.getElementById("lista-pacientes");

if (corpoTabela) {
    const salvos = JSON.parse(localStorage.getItem("pacientes")) || [];

    salvos.forEach(function (paciente) {
        const linha = document.createElement("tr");
        linha.innerHTML = "<td></td><td></td><td></td><td><a href='prontuario.html'>Ver prontuário</a></td>";
        linha.cells[0].textContent = paciente.nome;
        linha.cells[1].textContent = paciente.cpf;
        linha.cells[2].textContent = paciente.telefone;
        corpoTabela.appendChild(linha);
    });
}

// ----- FORM. TRIAGEM DE PACIENTE -----
const formTriagem = document.getElementById("form-triagem");

if (formTriagem) {
    formTriagem.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const triagem = {
            paciente: document.getElementById("paciente").value.trim(),
            queixa: document.getElementById("queixa").value.trim(),
            pressao: document.getElementById("pressao").value.trim(),
            temperatura: document.getElementById("temperatura").value,
            frequencia: document.getElementById("frequencia").value,
            saturacao: document.getElementById("saturacao").value,
            risco: formTriagem.elements["risco"].value,
            observacoes: document.getElementById("observacoes").value.trim(),
            chegada: new Date().toISOString()
        };

        const fila = JSON.parse(localStorage.getItem("fila")) || [];
        fila.push(triagem);
        localStorage.setItem("fila", JSON.stringify(fila));

        window.location.href = "fila.html";
    });
}

// ----- TELA DE FILA DE PACIENTES -----
const corpoFila = document.getElementById("lista-fila");

if (corpoFila) {
    const ordemRisco = { vermelho: 0, laranja: 1, amarelo: 2, verde: 3, azul: 4 };
    const nomesRisco = { vermelho: "Vermelho", laranja: "Laranja", amarelo: "Amarelo", verde: "Verde", azul: "Azul" };

    const aviso = document.getElementById("aviso-chamada");
    const vazia = document.getElementById("fila-vazia");

    function lerFila() {
        return JSON.parse(localStorage.getItem("fila")) || [];
    }

    function mostrarFila() {
        const fila = lerFila();

        // 1o por risco (vermelho primeiro), 2o por horario de chegada
        fila.sort(function (a, b) {
            if (ordemRisco[a.risco] !== ordemRisco[b.risco]) {
                return ordemRisco[a.risco] - ordemRisco[b.risco];
            }
            return new Date(a.chegada) - new Date(b.chegada);
        });

        corpoFila.innerHTML = "";
        vazia.hidden = fila.length > 0;

        fila.forEach(function (paciente, indice) {
            const linha = document.createElement("tr");
            linha.innerHTML =
                "<td></td><td></td><td><span class='tag-risco'></span></td><td></td>" +
                "<td><button type='button'>Chamar</button></td>";

            linha.cells[0].textContent = indice + 1;
            linha.cells[1].textContent = paciente.paciente;

            const tag = linha.querySelector(".tag-risco");
            tag.textContent = nomesRisco[paciente.risco];
            tag.classList.add(paciente.risco);

            linha.cells[3].textContent = new Date(paciente.chegada).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            });

            // a hora de chegada identifica cada paciente na hora de chamar
            linha.querySelector("button").dataset.chegada = paciente.chegada;

            corpoFila.appendChild(linha);
        });
    }

    // clique em qualquer botao "Chamar" da tabela
    corpoFila.addEventListener("click", function (evento) {
        const botao = evento.target.closest("button");
        if (!botao) return;

        const fila = lerFila();
        const chamado = fila.find(function (p) {
            return p.chegada === botao.dataset.chegada;
        });
        if (!chamado) return;

        // notificacao na tela
        aviso.textContent = "Chamando: " + chamado.paciente + " - dirigir-se ao atendimento";
        aviso.hidden = false;

        // tira o paciente da fila e redesenha a tabela
        const restante = fila.filter(function (p) {
            return p.chegada !== chamado.chegada;
        });
        localStorage.setItem("fila", JSON.stringify(restante));
        mostrarFila();
    });

    mostrarFila();
}

/*----- AGENDAMENTO DE PACIENTE -----*/
/* ===== Agendamento (colar no fim do app.js) ===== */

const corpoConsultas = document.getElementById("lista-consultas");
const formAgendamento = document.getElementById("form-agendamento");

if (corpoConsultas && formAgendamento) {
    const mensagem = document.getElementById("mensagem-agendamento");
    const vazia = document.getElementById("consultas-vazia");
    const campoData = document.getElementById("data");

    // nao deixa escolher data passada
    // (o idioma "sv-SE" devolve a data local no formato AAAA-MM-DD)
    campoData.min = new Date().toLocaleDateString("sv-SE");

    function lerConsultas() {
        const guardadas = localStorage.getItem("consultas");

        // primeira vez: guarda alguns exemplos para a lista nao comecar vazia
        if (guardadas === null) {
            const exemplos = [
                { id: 1, paciente: "Maria Souza", medico: "Dra. Helena Duarte - Clínica geral", data: "2026-12-01", horario: "08:00" },
                { id: 2, paciente: "João Pedro Almeida", medico: "Dr. Rafael Menezes - Cardiologia", data: "2026-12-01", horario: "09:30" },
                { id: 3, paciente: "Ana Clara Ferreira", medico: "Dra. Camila Torres - Pediatria", data: "2026-12-02", horario: "14:00" }
            ];
            localStorage.setItem("consultas", JSON.stringify(exemplos));
            return exemplos;
        }

        return JSON.parse(guardadas);
    }

    function salvarConsultas(lista) {
        localStorage.setItem("consultas", JSON.stringify(lista));
    }

    function mostrarConsultas() {
        const lista = lerConsultas();

        // da mais proxima para a mais distante (data + horario)
        lista.sort(function (a, b) {
            return (a.data + a.horario).localeCompare(b.data + b.horario);
        });

        corpoConsultas.innerHTML = "";
        vazia.hidden = lista.length > 0;

        lista.forEach(function (consulta) {
            const linha = document.createElement("tr");
            linha.innerHTML =
                "<td></td><td></td><td></td><td></td>" +
                "<td><button type='button'>Cancelar</button></td>";

            // 2026-12-01 vira 01/12/2026
            linha.cells[0].textContent = consulta.data.split("-").reverse().join("/");
            linha.cells[1].textContent = consulta.horario;
            linha.cells[2].textContent = consulta.paciente;
            linha.cells[3].textContent = consulta.medico;

            linha.querySelector("button").dataset.id = consulta.id;

            corpoConsultas.appendChild(linha);
        });
    }

    // agendar
    formAgendamento.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nova = {
            id: Date.now(),
            paciente: document.getElementById("paciente").value.trim(),
            medico: document.getElementById("medico").value,
            data: document.getElementById("data").value,
            horario: document.getElementById("horario").value
        };

        const lista = lerConsultas();

        // mesmo medico, mesmo dia e mesma hora = horario ocupado
        const ocupado = lista.some(function (c) {
            return c.medico === nova.medico && c.data === nova.data && c.horario === nova.horario;
        });

        if (ocupado) {
            mensagem.textContent = "Esse horário já está ocupado para este médico. Escolha outro.";
            return;
        }

        lista.push(nova);
        salvarConsultas(lista);

        mensagem.textContent = "Consulta agendada com sucesso.";
        formAgendamento.reset();
        mostrarConsultas();
    });

    // cancelar (clique em qualquer botao da tabela)
    corpoConsultas.addEventListener("click", function (evento) {
        const botao = evento.target.closest("button");
        if (!botao) return;

        const restante = lerConsultas().filter(function (c) {
            return String(c.id) !== botao.dataset.id;
        });

        salvarConsultas(restante);
        mensagem.textContent = "";
        mostrarConsultas();
    });

    mostrarConsultas();
}