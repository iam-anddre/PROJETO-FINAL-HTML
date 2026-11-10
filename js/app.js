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
        if (guardadas === nul) {
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

/* ===== Busca de medicos ===== */
const buscaMedico = document.getElementById("busca-medico");

if (buscaMedico) {
    const cartoes = document.querySelectorAll(".medico");

    function semAcento(texto) {
        return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    buscaMedico.addEventListener("input", function () {
        const termo = semAcento(buscaMedico.value.trim());

        cartoes.forEach(function (cartao) {
            cartao.hidden = !semAcento(cartao.textContent).includes(termo);
        });
    });
}

/* ===== PAGINA USUARIOS ===== */
/* ===== Usuarios ===== */

const corpoUsuarios = document.getElementById("lista-usuarios");
const formUsuario = document.getElementById("form-usuario");

if (corpoUsuarios && formUsuario) {
    const mensagem = document.getElementById("mensagem-usuario");
    const vazia = document.getElementById("usuarios-vazia");

    function lerUsuarios() {
        const guardados = localStorage.getItem("usuarios");

        // primeira vez: guarda alguns exemplos para a lista nao comecar vazia
        if (guardados === null) {
            const exemplos = [
                { id: 1, nome: "Roberto Albuquerque", matricula: "2024001", perfil: "Diretor(a)", senha: "123456", ativo: true },
                { id: 2, nome: "Dra. Helena Duarte", matricula: "2024002", perfil: "Médico(a)", senha: "123456", ativo: true },
                { id: 3, nome: "Dr. Rafael Menezes", matricula: "2024003", perfil: "Médico(a)", senha: "123456", ativo: true },
                { id: 4, nome: "Juliana Prado", matricula: "2024004", perfil: "Enfermeiro(a)", senha: "123456", ativo: true },
                { id: 5, nome: "Carla Mendonça", matricula: "2024005", perfil: "Recepcionista", senha: "123456", ativo: true },
                { id: 6, nome: "Pedro Henrique Lacerda", matricula: "2024006", perfil: "Recepcionista", senha: "123456", ativo: false }
            ];
            localStorage.setItem("usuarios", JSON.stringify(exemplos));
            return exemplos;
        }

        return JSON.parse(guardados);
    }

    function salvarUsuarios(lista) {
        localStorage.setItem("usuarios", JSON.stringify(lista));
    }

    function mostrarUsuarios() {
        const lista = lerUsuarios();

        // ordem alfabetica
        lista.sort(function (a, b) {
            return a.nome.localeCompare(b.nome, "pt-BR");
        });

        corpoUsuarios.innerHTML = "";
        vazia.hidden = lista.length > 0;

        lista.forEach(function (usuario) {
            const linha = document.createElement("tr");
            linha.innerHTML =
                "<td></td><td></td><td></td>" +
                "<td><span class='tag-situacao'></span></td>" +
                "<td><button type='button'></button></td>";

            linha.cells[0].textContent = usuario.nome;
            linha.cells[1].textContent = usuario.matricula;
            linha.cells[2].textContent = usuario.perfil;

            const tag = linha.querySelector(".tag-situacao");
            tag.textContent = usuario.ativo ? "Ativo" : "Inativo";
            tag.classList.add(usuario.ativo ? "situacao-ativo" : "situacao-inativo");

            const botao = linha.querySelector("button");
            botao.textContent = usuario.ativo ? "Desativar" : "Ativar";
            botao.dataset.id = usuario.id;

            corpoUsuarios.appendChild(linha);
        });
    }

    // cadastrar
    formUsuario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const novo = {
            id: Date.now(),
            nome: document.getElementById("nome").value.trim(),
            matricula: document.getElementById("matricula").value.trim(),
            perfil: document.getElementById("perfil").value,
            senha: document.getElementById("senha").value,
            ativo: true
        };
        const confirmar = document.getElementById("confirmar").value;

        if (novo.senha !== confirmar) {
            mensagem.textContent = "As senhas não conferem.";
            return;
        }

        const lista = lerUsuarios();

        const repetida = lista.some(function (u) {
            return u.matricula === novo.matricula;
        });

        if (repetida) {
            mensagem.textContent = "Já existe um usuário com essa matrícula.";
            return;
        }

        lista.push(novo);
        salvarUsuarios(lista);

        mensagem.textContent = "Usuário cadastrado com sucesso.";
        formUsuario.reset();
        mostrarUsuarios();
    });

    // ativar / desativar (clique em qualquer botao da tabela)
    corpoUsuarios.addEventListener("click", function (evento) {
        const botao = evento.target.closest("button");
        if (!botao) return;

        const lista = lerUsuarios();

        lista.forEach(function (u) {
            if (String(u.id) === botao.dataset.id) {
                u.ativo = !u.ativo;
            }
        });

        salvarUsuarios(lista);
        mensagem.textContent = "";
        mostrarUsuarios();
    });

    mostrarUsuarios();
}

/* LEITOS */

const corpoLeitos = document.getElementById("lista-leitos");

if (corpoLeitos) {
    const campoBusca = document.getElementById("busca-leito");
    const vazio = document.getElementById("leitos-vazio");

    function normalizar(texto) {
        return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // monta a lista inicial de leitos (so na primeira vez)
    function criarLeitos() {
        const setores = [
            { nome: "Clínica Geral", primeiro: 101, total: 6, ocupados: [101, 102, 104, 105] },
            { nome: "Pediatria", primeiro: 201, total: 5, ocupados: [202, 203] },
            { nome: "UTI", primeiro: 301, total: 4, ocupados: [301, 302, 303] },
            { nome: "Maternidade", primeiro: 401, total: 5, ocupados: [401, 404] },
            { nome: "Ortopedia", primeiro: 501, total: 4, ocupados: [502] }
        ];

        const lista = [];

        setores.forEach(function (setor) {
            for (let i = 0; i < setor.total; i++) {
                const numero = setor.primeiro + i;
                lista.push({
                    numero: numero,
                    setor: setor.nome,
                    ocupado: setor.ocupados.includes(numero)
                });
            }
        });

        return lista;
    }

    function lerLeitos() {
        const guardados = localStorage.getItem("leitos");

        if (guardados === null) {
            const inicial = criarLeitos();
            localStorage.setItem("leitos", JSON.stringify(inicial));
            return inicial;
        }

        return JSON.parse(guardados);
    }

    function salvarLeitos(lista) {
        localStorage.setItem("leitos", JSON.stringify(lista));
    }

    function mostrarLeitos() {
        const todos = lerLeitos();

        // cartoes de resumo (contam todos os leitos, mesmo com busca)
        const ocupados = todos.filter(function (l) { return l.ocupado; }).length;
        const taxa = todos.length > 0 ? Math.round((ocupados / todos.length) * 100) : 0;

        document.getElementById("leitos-livres").textContent = todos.length - ocupados;
        document.getElementById("leitos-ocupados").textContent = ocupados;
        document.getElementById("total-leitos").textContent = todos.length;
        document.getElementById("taxa-ocupacao").textContent = taxa + "%";

        // busca por numero, setor ou situacao
        const termo = normalizar(campoBusca.value.trim());

        const visiveis = todos.filter(function (l) {
            const texto = l.numero + " " + l.setor + " " + (l.ocupado ? "ocupado" : "livre");
            return normalizar(texto).includes(termo);
        });

        visiveis.sort(function (a, b) {
            return a.numero - b.numero;
        });

        corpoLeitos.innerHTML = "";
        vazio.hidden = visiveis.length > 0;

        visiveis.forEach(function (leito) {
            const linha = document.createElement("tr");
            linha.innerHTML =
                "<td></td><td></td>" +
                "<td><span class='tag-leito'></span></td>" +
                "<td><button type='button'></button></td>";

            linha.cells[0].textContent = leito.numero;
            linha.cells[1].textContent = leito.setor;

            const tag = linha.querySelector(".tag-leito");
            tag.textContent = leito.ocupado ? "Ocupado" : "Livre";
            tag.classList.add(leito.ocupado ? "leito-ocupado" : "leito-livre");

            const botao = linha.querySelector("button");
            botao.textContent = leito.ocupado ? "Liberar" : "Ocupar";
            botao.dataset.numero = leito.numero;

            corpoLeitos.appendChild(linha);
        });
    }

    // clique em Ocupar / Liberar
    corpoLeitos.addEventListener("click", function (evento) {
        const botao = evento.target.closest("button");
        if (!botao) return;

        const lista = lerLeitos();

        lista.forEach(function (l) {
            if (String(l.numero) === botao.dataset.numero) {
                l.ocupado = !l.ocupado;
            }
        });

        salvarLeitos(lista);
        mostrarLeitos();
    });

    // busca: redesenha a lista a cada letra digitada
    campoBusca.addEventListener("input", mostrarLeitos);

    mostrarLeitos();
}