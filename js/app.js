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