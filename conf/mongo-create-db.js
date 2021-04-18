
// Mongoshell script to create an empty profiles db

db = connect('127.0.0.1:27017/blog-system');
db.dropDatabase();
db = connect('127.0.0.1:27017/blog-system');

/**
 * Sequences collection
 */
db.createCollection('sequences');
db.sequences.insertOne({
    name: 'post_id',
    value: 1
});
db.sequences.insertOne({
    name: "author_id",
    value: 1
})

function nextPostId() {
    return db.sequences.findOneAndUpdate(
        {name: "post_id"}, 
        {$inc: {value: 1}}).value
}

function nextAuthorId() {
    return db.sequences.findOneAndUpdate(
        {name: "author_id"}, 
        {$inc: {value: 1}}).value
}

/**
 * Blog posts collection
 */
db.createCollection('posts');

db.profiles.createIndex({'id': 1}, {unique: true});

db.posts.insertOne({
    id: nextPostId(),
    title: "Vacina não é 'elixir mágico' nem substitui prevenção, dizem médicos de SP.",
    location: "Santo Andre,  SP",
    author: "joaosilva",
    date: new Date("01/12/2020").toUTCString(),
    content: "Agora que a vacina está aí quase chegando, estou percebendo a diminuição de todos aqueles cuidados que tinha no início da pandemia. Acho que as pessoas vão chegando num ponto de fadiga, de não conseguir manter todo aquele nível de atenção e cuidado do começo....",
    cover: "cover_1.jpg"
})
db.posts.insertOne({
    id: nextPostId(),
    title: "Vacina de Oxford será testada em uso combinado com a russa Sputnik V",
    location: "Sao Paulo,  SP",
    author: "marinaamadeus",
    date: new Date("02/12/2020").toUTCString(),
    content: "O laboratório sueco AstraZeneca, que desenvolve uma vacina em parceria com a Universidade de Oxford, e a Rússia anunciaram hoje (11) testes clínicos conjuntos que combinam seus dois imunizantes contra o novo coronavírus....",
    cover: "cover_2.png"
})

/**
 * Authors collection
 */
db.createCollection('authors');
db.authors.createIndex({'id': 1}, {unique: true});
db.authors.createIndex({'username': 1}, {unique: true});

db.authors.insertOne({
     id: nextAuthorId(),
     username: 'joaosilva',
     fullname: 'Joao Silva',
     email: 'joaosilva@authors.com',
    //  password: 'joaosilva123'
    password: '$2b$10$oo6lVYVvSyFwqINxFS2.mumM9lIDBrn29hkhoP5ZWF6A2p9DHRiXK'
 });
db.authors.insertOne({
    id: nextAuthorId(),
    username: 'marinaamadeus',
    fullname: 'Marina Amadeus',
    email: 'marinamadeus@authors.com',
   //  password: 'marina123'
   password: '$2b$10$16r9QhMXpK7AytCUvU8VC.KtWHtV/9INh/ErAY6rLy5MrHjo/Sq4a'
});






