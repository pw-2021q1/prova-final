# Prova final

## Tema: *General Blog System*

Sistema de blog simplificado. O sistema possui as seguintes funcionalidades:

* login/logout de autores pré-cadastrados estaticamente
* inserção, listagem, remoção e edição de postagens
* autores são "administradores" do website, podendo realizar qualquer operação sobre qualquer postagem (exceto modificação de autoria)

Algumas funcionalidades estão incompletas, precisarão ser completadas como parte do enunciado da prova (vide Moodle).

## Instruções de execução

Executar todos os comandos na raiz do projeto. Assume-se que o ambiente de desenvolvimento esteja devidamente configurado.

1. Instalar as dependências: `yarn`
1. Popular o banco de dados com os autores estáticos e dados de teste: `mongo conf/mongo-create-db.js`
1. Iniciar a aplicação: `nodemon`
1. Se não houver erros, o sistema informará a porta em que o servidor está ouvindo.