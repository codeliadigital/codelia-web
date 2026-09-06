/* ==========================================================================
   Codelia — comportamiento de la web
   Sin librerías, sin cookies, sin almacenamiento y sin llamadas externas.
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     1. Cabecera: transparente arriba, con fondo crema al bajar
     ---------------------------------------------------------------------- */
  var cabecera = document.getElementById('cabecera');

  var pintarCabecera = function () {
    if (!cabecera) { return; }
    var menuAbierto = cabecera.querySelector('.navegacion.esta-abierta') !== null;
    cabecera.classList.toggle('esta-fija', window.scrollY > 12 || menuAbierto);
  };

  if (cabecera) {
    pintarCabecera();
    window.addEventListener('scroll', pintarCabecera, { passive: true });
  }

  /* ----------------------------------------------------------------------
     2. Menú hamburguesa (móvil)
     ---------------------------------------------------------------------- */
  var boton = document.getElementById('hamburguesa');
  var menu = document.getElementById('navegacion');

  if (boton && menu) {
    var cerrarMenu = function () {
      menu.classList.remove('esta-abierta');
      boton.setAttribute('aria-expanded', 'false');
      boton.setAttribute('aria-label', 'Abrir el menú');
      pintarCabecera();
    };

    boton.addEventListener('click', function () {
      var abierto = menu.classList.toggle('esta-abierta');
      boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      boton.setAttribute('aria-label', abierto ? 'Cerrar el menú' : 'Abrir el menú');
      pintarCabecera();
    });

    // Al pulsar un enlace del menú, se cierra
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) { cerrarMenu(); }
    });

    // Con la tecla Escape también
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('esta-abierta')) {
        cerrarMenu();
        boton.focus();
      }
    });

    // Si se ensancha la pantalla, el menú vuelve a su sitio
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) { cerrarMenu(); }
    });
  }

  /* ----------------------------------------------------------------------
     3. Aparición suave al hacer scroll (fade + 20px hacia arriba)
     ---------------------------------------------------------------------- */
  var elementos = document.querySelectorAll('.aparece');
  var sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || sinMovimiento) {
    Array.prototype.forEach.call(elementos, function (el) {
      el.classList.add('esta-visible');
    });
  } else {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) { return; }
        var el = entrada.target;
        var hermanos = el.parentElement ? el.parentElement.children : [];
        var posicion = Array.prototype.indexOf.call(hermanos, el);
        el.style.transitionDelay = Math.min(posicion, 3) * 70 + 'ms';
        el.classList.add('esta-visible');
        observador.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(elementos, function (el) {
      observador.observe(el);
    });
  }

  /* ----------------------------------------------------------------------
     4. Formulario: no envía nada. Redacta el correo y abre el programa
        de correo de la propia persona con el mensaje ya escrito.
     ---------------------------------------------------------------------- */
  var form = document.getElementById('formulario-contacto');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nombre   = form.nombre.value.trim();
      var negocio  = form.negocio.value.trim();
      var servicio = form.servicio.value;
      var extra    = form.extra.value.trim();

      var asunto = 'Nuevo proyecto — ' + negocio;
      var cuerpo =
        'Hola Codelia:\n\n' +
        'Me llamo ' + nombre + ' y tengo un negocio que se llama ' + negocio + '.\n\n' +
        'Lo que necesito: ' + servicio + '\n\n' +
        (extra ? extra + '\n\n' : '') +
        'Podéis contestarme a este mismo correo.\n\n' +
        'Gracias.';

      window.location.href =
        'mailto:info@codeliadigital.com?subject=' + encodeURIComponent(asunto) +
        '&body=' + encodeURIComponent(cuerpo);
    });
  }

  /* ----------------------------------------------------------------------
     5. Botón de copiar la dirección de correo
     ---------------------------------------------------------------------- */
  var botonCopiar = document.getElementById('boton-copiar');
  var textoCopiar = document.getElementById('boton-copiar-texto');

  if (botonCopiar && textoCopiar) {
    var temporizador = null;

    var confirmar = function () {
      textoCopiar.textContent = 'Copiado';
      botonCopiar.classList.add('esta-copiado');
      clearTimeout(temporizador);
      temporizador = setTimeout(function () {
        textoCopiar.textContent = 'Copiar';
        botonCopiar.classList.remove('esta-copiado');
      }, 2000);
    };

    // Reserva para navegadores sin portapapeles moderno (o abierto con file://)
    var copiarAlaAntigua = function (texto) {
      var caja = document.createElement('textarea');
      caja.value = texto;
      caja.setAttribute('readonly', '');
      caja.style.position = 'fixed';
      caja.style.top = '-1000px';
      document.body.appendChild(caja);
      caja.select();
      var bien = false;
      try { bien = document.execCommand('copy'); } catch (err) { bien = false; }
      document.body.removeChild(caja);
      return bien;
    };

    botonCopiar.addEventListener('click', function () {
      var correo = botonCopiar.getAttribute('data-correo');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(correo).then(confirmar, function () {
          if (copiarAlaAntigua(correo)) { confirmar(); }
        });
      } else if (copiarAlaAntigua(correo)) {
        confirmar();
      }
    });
  }

})();
