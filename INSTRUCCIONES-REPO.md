# Del zip a Vercel, paso a paso

Instrucciones para **CMD de Windows**. Al final están las diferencias para
macOS y Linux. Copia y pega un bloque a la vez.

---

## 0. Antes de empezar

Necesitas dos programas instalados:

- **Node.js 20 o superior** — <https://nodejs.org> (elige la versión LTS)
- **Git** — <https://git-scm.com/downloads>

Y una cuenta de GitHub y otra de Vercel (puedes entrar a Vercel con GitHub).

Comprueba que quedaron bien instalados. Abre CMD y escribe:

```cmd
node -v
git --version
```

Si los dos responden con un número de versión, sigue. Si no, reinstala y vuelve
a abrir el CMD (las instalaciones nuevas no aparecen en ventanas ya abiertas).

---

## 1. Descomprimir el proyecto

Descomprime `broka.zip` donde quieras trabajar. Por ejemplo en
`C:\Users\TU-USUARIO\Documents\broka`.

Dentro de esa carpeta debes ver `package.json`, `app`, `components`, `lib`.
**Ese** es el nivel correcto: si ves otra carpeta `broka` dentro, entra a ella.

---

## 2. Abrir CMD en la carpeta

En el Explorador de Windows, abre la carpeta del proyecto, haz clic en la barra
de direcciones (donde dice la ruta), escribe `cmd` y pulsa Enter. Se abre el CMD
ya situado ahí.

Confirma que estás en el lugar correcto:

```cmd
dir package.json
```

Si responde que no encuentra el archivo, no estás en la carpeta correcta.

---

## 3. Instalar y probar en tu máquina

```cmd
npm install
```

Tarda un par de minutos la primera vez. Luego:

```cmd
npm run dev
```

Abre <http://localhost:3000> en el navegador. Deberías ver el sitio completo con
el configurador 3D funcionando.

Para detener el servidor: `Ctrl + C` y confirma con `S`.

---

## 4. Crear el repositorio local

```cmd
git init
git add .
git commit -m "Broka: tienda CNC con configurador parametrico 3D"
```

Si es la primera vez que usas Git en esta computadora, te pedirá identificarte:

```cmd
git config --global user.name "Tu Nombre"
git config --global user.email "tucorreo@ejemplo.com"
```

y repite el `git commit`.

> `node_modules` y `.next` no se suben: ya están excluidos en `.gitignore`.
> Vercel los reconstruye solo.

---

## 5. Crear el repositorio en GitHub

Entra a <https://github.com/new> y créalo así:

- **Repository name:** `broka`
- **Private** o **Public**, como prefieras
- **NO** marques «Add a README», «Add .gitignore» ni «Choose a license».
  El repositorio tiene que quedar **vacío** o el push fallará.

Pulsa **Create repository** y copia la URL que te muestra, con esta forma:
`https://github.com/TU-USUARIO/broka.git`

---

## 6. Subir el código

Sustituye `TU-USUARIO` por tu usuario real:

```cmd
git branch -M main
git remote add origin https://github.com/TU-USUARIO/broka.git
git push -u origin main
```

Te pedirá autenticarte con GitHub; se abre una ventana del navegador, autoriza y
listo. Recarga la página de GitHub: ya deben estar todos los archivos.

---

## 7. Desplegar en Vercel

1. Entra a <https://vercel.com/new> con tu cuenta de GitHub.
2. Busca el repositorio `broka` y pulsa **Import**.
3. **No cambies nada** en la pantalla de configuración: Vercel detecta Next.js
   solo, con su build command y su output directory.
4. Pulsa **Deploy** y espera un par de minutos.

Te queda una URL tipo `https://broka.vercel.app`. El sitio funciona completo en
**modo demo**: el configurador, el carrito y los favoritos son reales, y el
checkout confirma el pedido sin cobrar.

---

## 8. Activar el cobro real (opcional)

Cuando quieras cobrar de verdad:

1. En <https://dashboard.stripe.com/apikeys> copia tu **Secret key**. Empieza con
   `sk_test_` en modo prueba y con `sk_live_` en producción.
2. En Vercel: **Settings → Environment Variables**, añade
   `STRIPE_SECRET_KEY` con ese valor y guarda.
3. En **Deployments**, pulsa **Redeploy** en el último despliegue.
4. Para que el despiece de corte se genere al confirmarse el pago, crea el
   webhook en <https://dashboard.stripe.com/webhooks> apuntando a
   `https://TU-DOMINIO/api/webhooks/stripe` con el evento
   `checkout.session.completed`, y guarda su secreto como
   `STRIPE_WEBHOOK_SECRET` en Vercel.

En modo prueba, la tarjeta `4242 4242 4242 4242` con cualquier fecha futura y
cualquier CVC simula un pago exitoso.

---

## 9. Subir cambios después

Cada vez que edites algo (por ejemplo, meter tus fotos en `public/img`):

```cmd
git add .
git commit -m "Fotos de producto"
git push
```

Vercel despliega solo en cuanto recibe el push.

---

## macOS y Linux

Todo es igual salvo abrir la terminal: usa `cd` hasta la carpeta.

```bash
cd ~/Documents/broka
ls package.json
npm install
npm run dev
```

Los comandos de `git` y el resto de pasos son idénticos.

---

## Si algo falla

**`npm no se reconoce como un comando`** — Node no está instalado o el CMD se
abrió antes de instalarlo. Cierra el CMD, ábrelo de nuevo y prueba `node -v`.

**`fatal: not a git repository`** — no corriste `git init`, o no estás en la
carpeta del proyecto. Verifica con `dir package.json`.

**`failed to push some refs`** — creaste el repositorio de GitHub con README o
.gitignore. Bórralo y vuelve a crearlo vacío, o corre `git pull --rebase origin
main` antes del push.

**El build falla en Vercel** — corre `npm run build` en tu máquina para ver el
error completo; suele ser más claro que el log de Vercel.
