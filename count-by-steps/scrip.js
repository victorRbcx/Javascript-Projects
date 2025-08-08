function count() {
    var ini = window.document.getElementById('txtinicio')
    var fim = window.document.getElementById('txtfim')
    var passo = window.document.getElementById('txtpasso')
    var res = document.querySelector('p#conta')

    var i = Number(ini.value)
    var f = Number(fim.value)
    var p = Number(passo.value)


    if(ini.value.length == 0 || fim.value.length == 0 || passo.value.length == 0) {
        window.alert('Fill in the start, end and step fields correctly')
        res.innerHTML = 'Impossible to count'
    } else if (p == 0 || p < 0) {
            window.alert('Incorrect step, the program will assume the value 1')
            res.innerHTML = `Counting:  <br>` 
            p = 1

            if (i < f) {  
                // Upward count with incorrect step
                while (i <= f) {
                    res.innerHTML += `\u{1F449} ${i}`
                    i += p
                }
                res.innerHTML += `\u{1F449}`
                res.innerHTML += '\u{1F3C1}'
                }  else {
                    // Countdown with incorrect step
                    while (i >= f) {
                    res.innerHTML += `\u{1F449} ${i}`
                    i -= p
                }
                res.innerHTML += `\u{1F449}`
                res.innerHTML += '\u{1F3C1}'
                }
            
         } else if (i < f) {
            // Count up
            res.innerHTML = `Counting: <br> ` 
            while (i <= f) {
                res.innerHTML += `\u{1F449} ${i}`
                i += p
            }
            res.innerHTML += `\u{1F449} `
            res.innerHTML += '\u{1F3C1}'
        } else {
            // Countdown
            res.innerHTML = `Counting: <br>`
            while (i >= f) {
                res.innerHTML += `\u{1F449} ${i}`
                i -= p
            }
        }
    
}