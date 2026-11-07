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