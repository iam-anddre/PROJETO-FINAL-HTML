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