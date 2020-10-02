# Messaging App
Requerimientos:
Construir una aplicación de mensajería instantánea que use el protocolo ASCP.
Considere lo siguiente:
1. La aplicación podrá enviar y recibir mensajes usando el protocolo
ASCP en dos modos: 1) sin encripción, 2) con encripción.
2. Entonces, el usuario deberá tener la opción de encriptar mensajes
para privacidad, de ser así, también deberá solicitar una llave. Por
lo pronto asumimos que si dos usuarios quieren comunicarse de
manera confidencial ambos poseen la MISMA llave.
3. La aplicación deberá construir el mensaje y después encriptarlo
usando DES/ECB (esto significa que los encabezados también
están encriptados) y después se transmiten usando un socket TCP
4. Por lo pronto, el protocolo solo implementa un tipo de mensaje,
sin embargo, considere que eventualmente agregaremos otros
tipos de mensajes.
5. Cuando la aplicación recibe un mensaje, el mensaje deberá ser
desencriptado e interpretado para saber el tipo de mensaje (solo
uno para esta entrega)
6. Por lo pronto, el usuario deberá capturar la dirección IP del otro
usuario.
7. Cualquier host puede iniciar la comunicación
8. Las aplicaciones de los diferentes equipos deberán comunicarse
entre sí.
9. El puerto TCP a utilizar es 2020.
10. Deberá tener interfaz de usuario gráfica.

Contenido:
- Un archivo de Bootstrap.
- Un archivo de styles de css.
- La carpeta de los modulos de Node
- Los JSON del Git y el .gitignore
- El archivo html de la interfaz gráfica.
- Un archivo javascript del modelo ASCP message_template.js
- Un archivo javascript para el servidor.
- Un archivo javascript para el cliente script.js
- Este archivo ReadMe.

Es necesario cambiar la linea 1 del archivo script.js y la linea 9 de index.html a tu IP.
Para correr la aplicación se necesita descargar NodeJS y correr en la carpeta el comando
```
npm run start
```
