function calcular() {
  const txtn = document.getElementById('txtnum');
  const lista = document.getElementById('listaNumeros');
  const rawValue = txtn.value.trim();

  lista.innerHTML = '';

  if (rawValue === '' || Number.isNaN(Number(rawValue))) {

    window.alert('Enter a number to Multiply!');

    const option = document.createElement('option');
    option.textContent = 'Enter a number above';
    option.disabled = true;
    lista.appendChild(option);

    txtn.focus();
    return;
  }

  const n = Number(rawValue);

  for (let i = 0; i <= 10; i += 1) {
    const option = document.createElement('option');
    const calc = n * i;
    option.value = `tab${i}`;
    option.textContent = `${n} x ${i} = ${calc}`;
    lista.appendChild(option);
  }

  txtn.value = '';
  txtn.focus();
}
