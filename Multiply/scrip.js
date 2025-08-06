function calcular() {
var txtn = window.document.getElementById('txtnum')
var n = Number(txtn.value)
var lista = document.getElementById('listaNumeros')
lista.innerHTML = ''

    if ( txtn.value.length == 0 || isNaN(n)) {
        window.alert('Enter a number to Multiply!')
        var opcao = document.createElement('option')
        opcao.text = 'Enter a number above'
        lista.add(opcao);
    } else {

        for(var i = 0; i <= 10; i++) {
            var opcao = document.createElement('option')
            var calc = n * i
            opcao.value = `tab${i}`
            opcao.text = `${n} x ${i} = ${calc}`
            lista.add(opcao);
        }
    }
    txtn.value = '' 
}