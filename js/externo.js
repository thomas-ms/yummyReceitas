// Initialize Firebase
var config = {
    apiKey: "AIzaSyCAAIQL_5cC_-rTkkR82LHi7eH547tLrEk",
    authDomain: "yummy-18825.firebaseapp.com",
    databaseURL: "https://yummy-18825.firebaseio.com",
    projectId: "yummy-18825",
    storageBucket: "yummy-18825.appspot.com",
    messagingSenderId: "944894136390"
};
firebase.initializeApp(config);
var database = firebase.database();
var ingredientes = [];

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        $('#menuDeslogado').addClass('hide');
        $('#menuLogado').removeClass('hide');
        database.ref('users/' + user.uid).once('value').then(function (snapshot) {
            username = (snapshot.val() && snapshot.val().nome) || 'Anonymous';
            $('#nomeLogado').text(' ' + username);
            $('#nomeUserMssg').text(' ' + username);
        });
    } else {
        $('#menuLogado').addClass('hide');
        $('#menuDeslogado').removeClass('hide');
    }
});

function writeUserData(id, nome, data, cidade, estado, telefone, email) {
    firebase.database().ref('users/' + id).set({
        id: id,
        nome: nome.toUpperCase(),
        dataNascimento: data,
        cidade: cidade,
        estado: estado,
        telefone: telefone,
        email: email
    });
};

$('#btnCadastrar').click(function () {
    var email = $('#emailCadastro').val();
    var password = $('#senhaCadastro').val();
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function (user) {
            var nome = $('#nomeCadastro').val();
            var data = $('#dataCadastro').val();
            var cidade = $('#cidadeCadastro').val();
            var estado = $('#estadoCadastro').dropdown('get value');
            var telefone = $('#telefoneCadastro').val();
            var id = user.uid;
            writeUserData(id, nome, data, cidade, estado, telefone, email);
            localStorage.setItem('message', 'Cadastro efetuado com sucesso!');
            window.location.href = '../views/inicial.html';
        })
        .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorMessage);
            alert(errorMessage);
            // ...
        });
});


function writeRecipeData(nome, descricao, imagens, video, categorias, tempo, cozimento, valor, porcoes, ingredientes, instrucoes) {
    var img = false;
    var key = firebase.database().ref('recipes').push().key;

    if (imagens) {
        img = 0;
        imagens.forEach(function (imagem, i) {
            firebase.storage().ref('images/' + key + '/' + i).put(imagem);
            img = img + 1;
        });
    }

    var data = new Date(Date.now());
    var dataString = data.getDate() + '/' + (data.getMonth() + 1) + '/' + data.getFullYear();
    firebase.database().ref('recipes/' + key).set({
        id: key,
        autor: firebase.auth().currentUser.uid,
        nome: nome,
        descricao: descricao,
        categorias: categorias,
        tempoReceita: tempo,
        cozimento: cozimento,
        valorNut: valor,
        porcoes: porcoes,
        ingredientes: ingredientes,
        instrucoes: instrucoes,
        dataCriacao: dataString,
        avaliacao: {
            estrelas: 0,
            quantidade: 0
        },
        avaliacoes: null,
        imagens: img,
        video: video
    });

    categorias.forEach(function (categoria) {
        firebase.database().ref('categorias/' + categoria + '/' + key).set({
            value: true
        });
    });

    if (video) {
        firebase.database().ref('videos/' + key).set({
            url: video
        })
    }
}

$('#btnLogin').click(function () {
    var email = $('#fieldEmail').val();
    var password = $('#fieldSenha').val();

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function (user) {
            localStorage.setItem('message', 'Login efetuado com sucesso!');
            window.location.href = '../views/inicial.html';
        })
        .catch(function (error) {
            var errorCode = error.code;
            if (errorCode === 'auth/wrong-password') {
                alert('Senha incorreta, tente novamente!');
            }
            if (errorCode === 'auth/user-not-found') {
                alert('Não existe nenhum usuário cadastrado no sistema com o e-mail fornecido!');
            }
        });
});

$('.form.login')
    .form({
        on: 'submit',
        fields: {
            email: {
                identifier: 'email',
                rules: [
                    {
                        type: 'email',
                        prompt: 'Por favor, coloque um email válido!'
                    }
                ]
            },
        }
    });

$('#novaRec').click(function () {
    $('#modalNovaReceita').modal({
        onDeny: function () {
            $('#modalNovaReceita').modal('hide');
            return false;
        },
        onShow: function () {
            var user = firebase.auth().currentUser;
            database.ref('users/' + user.uid).once('value').then(function (snapshot) {
                username = (snapshot.val() && snapshot.val().nome) || 'Anonymous';
                $('#autorReceita').text(username);
            });

        },
        onApprove: function () {
            var nome = $('#nomeReceita').val();
            var descricao = $('#descricaoReceita').val();
            var imagens = Array.from(document.getElementById('imagemReceita').files);
            if (!imagens) {
                imagens = null;
            }
            var video = $('#videoReceita').val();
            if (!video) {
                video = null;
            }
            var categorias = $("#categoriasReceita").dropdown('get value');
            var tempo = $('#tempoReceita').val();
            var cozimento = $('#cozimentoReceita').dropdown('get value');
            var valor = $('#nutricionalReceita').val();
            var porcoes = $('#porcoesReceita').val();
            var ingr = ingredientes;
            ingredientes = [];
            var instrucoes = $('#instrucoesReceita').val();
            writeRecipeData(nome, descricao, imagens, video, categorias, tempo, cozimento, valor, porcoes, ingr, instrucoes);
        },
        onHidden: function () {
            $('#nomeReceita').val('');
            $('#descricaoReceita').val('');
            document.getElementById('imagemReceita').value = null;
            document.getElementById('videoReceita').value = null;
            $("#categoriasReceita").dropdown('set exactly', null);
            $('#tempoReceita').val('');
            $('#cozimentoReceita').dropdown('set exactly', null);
            $('#nutricionalReceita').val('');
            $('#porcoesReceita').val('');
            ingredientes = [];
            $('#instrucoesReceita').val('');
            location.reload();
        }
    }).modal('show');
});

$('#homeButton').one('mouseenter', function () {
    setTimeout(function () {
        $('#spanTitulo').text('H');
        setTimeout(function () {
            $('#spanTitulo').text('HH');
            setTimeout(function () {
                $('#spanTitulo').text('HHH');
                setTimeout(function () {
                    $('#spanTitulo').text('HHH');
                    setTimeout(function () {
                        $('#spanTitulo').text('HHHH');
                        setTimeout(function () {
                            $('#spanTitulo').text('HHH');
                            setTimeout(function () {
                                $('#spanTitulo').text('HH');
                                setTimeout(function () {
                                    $('#spanTitulo').text('H');
                                    setTimeout(function () {
                                        $('#spanTitulo').text('');
                                    }, 200);
                                }, 200);
                            }, 200);
                        }, 200);
                    }, 200);
                }, 200);
            }, 200);
        }, 200);
    }, 200);
});

$('#logoutBtn').click(function () {
    firebase.auth().signOut().then(function () {
        window.location = '../views/login.html';
    }).catch(function (error) {
        console.log("Erro no logout");
    });
});

$('#modalNovaReceita .ui.accordion').accordion({
    selector: {
        trigger: '#novoIngrediente'
    }
});

$('#modalNovaReceita #salvaNovoIngr').click(function () {
    $('#listaIngredientes ul').append('<li>' + $('#novoIngr').val() + ' - ' + $('#quantIngr').val() + ' ' + $('#unidadeIngr').val() + '<i class="link remove icon"></i>');
    $('.modal .ui.accordion').accordion('close', 0);
    var ingrediente = {};
    ingrediente.nome = $('#novoIngr').val();
    ingrediente.quantidade = $('#quantIngr').val();
    ingrediente.unidade = $('#unidadeIngr').val();
    ingredientes.push(ingrediente);
    $('#novoIngr').val('');
    $('#quantIngr').val('');
    $('#unidadeIngr').val('');
    return false;
})

$('#modalNovaReceita').on('click', 'ul > li > i.link.remove.icon', function () {
    $(this).parent().remove();
});

function criarVideos() {
    var videoSeg = $('#videoSeg')[0];
    firebase.database().ref('videos/').once('value').then(function (snapshot) {
        var lista = Object.values(snapshot.val()).slice(-5);
        var seg = document.getElementById('videoSeg');
        width = window.getComputedStyle(seg, null)['width'];
        width = parseFloat(width);
        lista.forEach(function (video, i) {
            var iframe = document.createElement('iframe');
            iframe.setAttribute('width', (width - 25) + 'px');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('src', video.url.replace("watch?v=", "embed/"));
            videoSeg.appendChild(iframe);
        })
    })
}


function criarItems(chavesCat, idDiv) {
    chavesCat.forEach(function (chave) {
        firebase.database().ref('recipes/' + chave).once('value').then(function (snapshot) {
            receita = snapshot.val();

            var article = document.createElement('article');
            article.setAttribute('class', 'item');
            document.getElementById(idDiv).appendChild(article);

            var divImagem = document.createElement('div');
            divImagem.setAttribute('class', 'image');
            article.appendChild(divImagem);

            if (receita.imagens) {
                firebase.storage().ref('images/' + receita.id + '/0').getDownloadURL().then(function (url) {
                    var img = document.createElement('img');
                    img.setAttribute('src', url);
                    divImagem.appendChild(img);
                })
            } else {
                var img = document.createElement('img');
                img.setAttribute('src', 'http://www.techweez.com/wp-content/uploads/2017/07/NO-IMAGE.png');
                divImagem.appendChild(img);
            }

            var div = document.createElement('div');
            div.setAttribute('class', 'content');
            article.appendChild(div);

            var a = document.createElement('a');
            a.setAttribute('class', 'header');
            a.innerText = receita.nome;
            div.appendChild(a);

            var div1 = document.createElement('div');
            div1.setAttribute('class', 'ui star rating right floated');
            var aval = receita.avaliacao.quantidade;
            if (aval != 0) {
                aval = Math.floor(receita.avaliacao.estrelas / receita.avaliacao.quantidade);
            }
            div1.setAttribute('data-rating', aval);
            div1.setAttribute('data-max-rating', '5');
            div.appendChild(div1);

            var p = document.createElement('p');
            p.setAttribute('class', 'meta right floated avaliacao');
            p.innerText = 'Avaliada por ' + receita.avaliacao.quantidade + ' usuário(s):';
            div.appendChild(p);

            var div1 = document.createElement('div');
            div1.setAttribute('class', 'meta');
            div.appendChild(div1);

            var span = document.createElement('span');
            span.setAttribute('class', 'data');
            span.innerText = 'Adcionada em: ' + receita.dataCriacao;
            div1.appendChild(span);

            var divAutor = document.createElement('div');
            divAutor.setAttribute('class', 'meta');
            div.appendChild(divAutor);
            firebase.database().ref('users/' + receita.autor).once('value').then(function (snapshot) {
                var span = document.createElement('span');
                span.setAttribute('class', 'autor');
                span.innerText = 'Autor: ' + snapshot.val().nome;
                divAutor.appendChild(span);
            })


            var div1 = document.createElement('div');
            div1.setAttribute('class', 'description');
            div.appendChild(div1);

            var p = document.createElement('p');
            p.innerText = receita.descricao;
            div1.appendChild(p);

            var div1 = document.createElement('div');
            div1.setAttribute('class', 'extra');
            div.appendChild(div1);

            var div2 = document.createElement('div');
            div2.setAttribute('class', 'ui right floated primary button detalhes');
            div2.setAttribute('name', receita.id);
            div2.innerText = 'Ver Detalhes';
            div1.appendChild(div2);

            var i = document.createElement('i');
            i.setAttribute('class', 'right chevron icon');
            div2.appendChild(i);

            receita.categorias.forEach(function (categoria) {
                var div2 = document.createElement('div');
                div2.setAttribute('class', 'ui teal tag label');
                div2.innerText = categoria;
                div1.appendChild(div2);
            });
            $('.ui.rating').rating('disable');
            $('.button.detalhes').click(function () {
                criarModalDetalhes(this.getAttribute('name'));
            })
        });
    })
}

function criarModalDetalhes(idReceita) {
    var texto = '';
    var aval = 0;
    var quant = 0;
    //CEHCA SE USUARIO JA VOTOU
    firebase.database().ref('recipes/' + idReceita + '/avaliacoes/' + firebase.auth().currentUser.uid).once('value').then(function (snapshot) {
        if (snapshot.val()) { //JA VOTOU
            texto = 'Avaliada por ' + receita.avaliacao.quantidade + ' usuário(s):'
            aval = snapshot.val().estrelas;
        } else { //AINDA NAO
            texto = 'Deixe seu voto: ';
            aval = 0;
        }
    });

    firebase.database().ref('recipes/' + idReceita).once('value').then(function (snapshot) {
        var receita = snapshot.val();
        var modal = document.getElementById('modalDetalhes');
        modal.setAttribute('itemtype', 'http://schema.org/Recipe');

        var div = document.createElement('div');
        div.setAttribute('class', 'ui grid header');
        modal.appendChild(div);

        var div1 = document.createElement('div');
        div1.setAttribute('class', 'two column row');
        div.appendChild(div1);

        var div2 = document.createElement('div');
        div2.setAttribute('class', 'left floated column modal-header');
        div2.setAttribute('id', 'nomeReceitaXML');
        div2.setAttribute('itemprop', 'name');
        div2.innerText = receita.nome;
        div1.appendChild(div2);

        var div2 = document.createElement('div');
        div2.setAttribute('class', 'right floated column right aligned');
        div1.appendChild(div2);

        receita.categorias.forEach(function (categoria) {
            var a = document.createElement('a');
            a.setAttribute('class', 'ui teal tag label categoriaReceita');
            a.setAttribute('itemprop', 'recipeCategory');
            a.innerText = categoria;
            div2.appendChild(a);
        });

        var div = document.createElement('div');
        div.setAttribute('class', 'scrolling image content');
        modal.appendChild(div);

        var imgContainer = document.createElement('div');
        imgContainer.setAttribute('class', 'ui medium image image-detalhes');
        div.appendChild(imgContainer);

        var div1 = document.createElement('div');
        div1.setAttribute('class', 'description');
        div.appendChild(div1);

        var div2 = document.createElement('div');
        div2.setAttribute('class', 'ui huge header');
        div2.innerText = receita.nome;
        div1.appendChild(div2);

        var button = document.createElement('button');
        button.setAttribute('title', 'Exportar');
        button.setAttribute('class', 'mini ui teal icon button right floated button-icon');
        button.setAttribute('id', 'buttonExportar');
        div2.appendChild(button);

        var i = document.createElement('i');
        i.setAttribute('class', 'external share icon');
        button.appendChild(i);

        var button = document.createElement('button');
        button.setAttribute('title', 'Imprimir');
        button.setAttribute('class', 'mini ui teal icon button right floated button-icon');
        button.setAttribute('id', 'buttonImprimir');
        div2.appendChild(button);

        var i = document.createElement('i');
        i.setAttribute('class', 'print icon');
        button.appendChild(i);

        var div2 = document.createElement('div');
        div2.setAttribute('class', 'ui grid');
        div1.appendChild(div2);

        var p = document.createElement('p');
        p.setAttribute('class', 'meta avaliacao');
        p.setAttribute('id', 'textoAvaliacao');
        p.innerText = texto;
        div2.appendChild(p);

        var div3 = document.createElement('div');
        div3.setAttribute('class', 'ui large star rating');
        div3.setAttribute('data-rating', aval);
        div3.setAttribute('data-max-rating', '5');
        div3.setAttribute('id', 'avaliacaoReceitaXML');
        div3.setAttribute('itemprop', 'aggregateRating');
        div2.appendChild(div3);

        var div3 = document.createElement('div');
        div3.setAttribute('class', 'two column row');
        div2.appendChild(div3);

        var divMeta1 = document.createElement('div');
        divMeta1.setAttribute('class', 'column');
        div3.appendChild(divMeta1);

        firebase.database().ref('users/' + receita.autor).once('value').then(function (snapshot) {
            var div5 = document.createElement('div');
            div5.setAttribute('class', 'meta');
            div5.setAttribute('id', 'autorReceitaXML');
            div5.setAttribute('itemprop', 'author');
            div5.innerText = 'Autor: ' + snapshot.val().nome;;
            divMeta1.appendChild(div5);
        })

        var div5 = document.createElement('div');
        div5.setAttribute('class', 'meta');
        div5.innerText = 'Criada em: ' + receita.dataCriacao;
        divMeta1.appendChild(div5);

        var div5 = document.createElement('div');
        div5.setAttribute('class', 'meta');
        div5.setAttribute('id', 'tempoReceitaXML');
        div5.setAttribute('itemprop', 'cookTime');
        div5.innerText = 'Tempo de preparo: ' + receita.tempoReceita + ' min';
        divMeta1.appendChild(div5);

        var div4 = document.createElement('div');
        div4.setAttribute('class', 'column');
        div3.appendChild(div4);

        var div5 = document.createElement('div');
        div5.setAttribute('class', 'meta');
        div5.setAttribute('itemprop', 'recipeYield');
        div5.setAttribute('id', 'rendimentoReceitaXML');
        div5.innerText = 'Porções: ' + receita.porcoes;
        div4.appendChild(div5);

        var div5 = document.createElement('div');
        div5.setAttribute('class', 'meta');
        div5.setAttribute('id', 'valorNutReceitaXML');
        div5.setAttribute('itemprop', 'nutrition');
        div5.innerText = 'Calorias: ' + receita.valorNut;
        div4.appendChild(div5);

        var div5 = document.createElement('div');
        div5.setAttribute('class', 'meta');
        div5.setAttribute('itemprop', 'cookingMethod');
        div5.innerText = 'Método de cozimento: ' + receita.cozimento;
        div4.appendChild(div5);

        var div2 = document.createElement('div');
        div2.setAttribute('class', 'ui dividing big header');
        div2.innerText = 'Descrição';
        div1.appendChild(div2);

        var p = document.createElement('p');
        p.setAttribute('id', 'descricaoReceitaXML');
        p.setAttribute('itemprop', 'description');
        p.innerText = receita.descricao;
        div1.appendChild(p);

        var div2 = document.createElement('div');
        div2.setAttribute('class', 'ui dividing big header');
        div2.innerText = 'Ingredientes';
        div1.appendChild(div2);

        if (receita.ingredientes) {
            receita.ingredientes.forEach(function (ingrediente) {
                var p = document.createElement('p');
                p.setAttribute('class', 'ingrediente ingredienteXML');
                p.setAttribute('itemprop', 'recipeIngredient');
                p.innerText = ingrediente.nome + ' - ' + ingrediente.quantidade + ' ' + ingrediente.unidade;
                div1.appendChild(p);
            });
        }

        var div2 = document.createElement('div');
        div2.setAttribute('class', 'ui dividing big header');
        div2.innerText = 'Instruções de preparo';
        div1.appendChild(div2);

        var p = document.createElement('p');
        p.setAttribute('id', 'instrucoesReceitaXML');
        p.setAttribute('itemprop', 'recipeInstructions');
        p.innerText = receita.instrucoes;
        div1.appendChild(p);

        var div2 = document.createElement('div');
        div2.setAttribute('class', 'ui dividing big header');
        div2.innerText = 'Comentários';
        div1.appendChild(div2);

        var div2comm = document.createElement('div');
        div2comm.setAttribute('class', 'ui comments');
        div1.appendChild(div2comm);

        firebase.database().ref('recipes/' + idReceita + '/comentarios').once('value').then(function (snapshot) {
            if (snapshot.val()) {
                var comentarios = Object.values(snapshot.val());
                comentarios.forEach(function (comentario) {
                    var div3 = document.createElement('div');
                    div3.setAttribute('class', 'comment');
                    div2comm.appendChild(div3);

                    var div4 = document.createElement('div');
                    div4.setAttribute('class', 'content');
                    div3.appendChild(div4);

                    var div5 = document.createElement('div');
                    div5.setAttribute('class', 'author');
                    div5.setAttribute('style', 'display : inline-block');
                    div5.innerText = comentario.autor;
                    div4.appendChild(div5);

                    var div5 = document.createElement('div');
                    div5.setAttribute('class', 'metadata');
                    div4.appendChild(div5);

                    var div6 = document.createElement('div');
                    div6.setAttribute('class', 'date');
                    div6.innerText = comentario.data;
                    div5.appendChild(div6);

                    var div5 = document.createElement('div');
                    div5.setAttribute('class', 'text');
                    div5.innerText = comentario.texto;
                    div4.appendChild(div5);

                    var hr = document.createElement('hr');
                    div2comm.appendChild(hr);
                })
            }

            if (firebase.auth().currentUser) {
                var form = document.createElement('form');
                form.setAttribute('class', 'ui reply form');
                div2comm.appendChild(form);

                var div3 = document.createElement('div');
                div3.setAttribute('class', 'field');
                form.appendChild(div3);

                var textarea = document.createElement('textarea');
                textarea.setAttribute('id', 'textComment');
                div3.appendChild(textarea);

                var div3 = document.createElement('div');
                div3.setAttribute('id', 'criaComentario');
                div3.setAttribute('class', 'ui teal submit icon button');
                div3.innerText = 'Adicionar Comentário';
                form.appendChild(div3);
            }

            if (receita.imagens) {
                var carousel = document.createElement('div');
                carousel.setAttribute('class', 'main-carousel');
                imgContainer.appendChild(carousel);

                $('.main-carousel').flickity({
                    // options
                    cellAlign: 'left',
                    contain: true,
                    imagesLoaded: true,
                    autoPlay: true,
                    prevNextButtons: false
                });

                for (i = 0; i < receita.imagens; i++) {
                    firebase.storage().ref('images/' + idReceita + '/' + i).getDownloadURL().then(function (url) {
                        var carouselCell = document.createElement('div');
                        carouselCell.setAttribute('class', 'carousel-cell');

                        var img = document.createElement('img');
                        img.setAttribute('src', url);
                        img.setAttribute('class', 'imagemReceitaXML');
                        img.setAttribute('itemprop', 'image');
                        carouselCell.appendChild(img);

                        var $cellElem = $('<div class="carousel-cell">' + carouselCell.innerHTML + '</div>');

                        $('.main-carousel').flickity('append', $cellElem);
                    })
                }
            } else {
                var img = document.createElement('img');
                img.setAttribute('src', 'http://www.techweez.com/wp-content/uploads/2017/07/NO-IMAGE.png');
                imgContainer.appendChild(img);
            }
        });


        var div = document.createElement('div');
        div.setAttribute('class', 'actions');
        modal.appendChild(div);

        var div1 = document.createElement('div');
        div1.setAttribute('class', 'ui teal approve button');
        div1.innerText = 'OK';
        div.appendChild(div1);

        var i = document.createElement('i');
        i.setAttribute('class', 'right chevron icon');
        div1.appendChild(i);

        // if (firebase.auth().currentUser.uid == receita.autor) {
        //     var div1 = document.createElement('div');
        //     div1.setAttribute('class', 'ui red button left floated');
        //     div1.innerText = 'Deletar';
        //     div.appendChild(div1);

        //     var div1 = document.createElement('div');
        //     div1.setAttribute('class', 'ui yellow button left floated');
        //     div1.innerText = 'Editar';
        //     div.appendChild(div1);
        // }

        $('.ui.rating').rating({
            onRate: function (rate) {
                // //checar se existem avaliacoes
                //     //checar se o usuario ja votou
                //     //se sim, excluir voto do usuario e colocar o novo
                //     //se nao, mandar para o bd o voto e incrementar quantidade
                // //mudar texto antes das estrelas
                // //setar numero de estrelas votado
                var usuario = firebase.auth().currentUser.uid;
                firebase.database().ref('recipes/' + idReceita).once('value').then(function (snapshot1) {
                    firebase.database().ref('recipes/' + idReceita + '/avaliacoes/' + usuario).once('value').then(function (snapshot2) {
                        var quantidade = snapshot1.val().avaliacao.quantidade;
                        var estrelas = snapshot1.val().avaliacao.estrelas;
                        if (snapshot2.val()) {
                            estrelas = estrelas - snapshot2.val().estrelas + rate;
                        } else {
                            estrelas = estrelas + rate;
                            quantidade = quantidade + 1;
                            $('#modalDetalhes p#textoAvaliacao')[0].innerText = 'Avaliada por ' + quantidade + ' usuários: ';
                        }
                        firebase.database().ref('recipes/' + idReceita + '/avaliacoes/' + usuario).set({
                            estrelas: rate
                        });
                        firebase.database().ref('recipes/' + idReceita + '/avaliacao').update({
                            estrelas: estrelas,
                            quantidade: quantidade
                        })
                    })
                });
            }
        });

        $('#modalDetalhes').on('click', '#criaComentario', function () {
            var comentario = {};
            var data = new Date(Date.now());
            comentario.data = data.getDate() + '/' + (data.getMonth() + 1) + '/' + data.getFullYear();
            comentario.texto = $('#textComment').val();
            firebase.database().ref('users/' + firebase.auth().currentUser.uid).once('value').then(function (snapshot) {
                comentario.autor = snapshot.val().nome;
                var key = firebase.database().ref('recipes/' + idReceita + '/comentarios').push().key;
                firebase.database().ref('recipes/' + idReceita + '/comentarios/' + key).set({
                    texto: comentario.texto,
                    data: comentario.data,
                    autor: comentario.autor,
                    autorId: firebase.auth().currentUser.uid
                });

                var div3 = document.createElement('div');
                div3.setAttribute('class', 'comment');
                $('.ui.comments').prepend(div3);

                var div4 = document.createElement('div');
                div4.setAttribute('class', 'content');
                div3.appendChild(div4);

                var div5 = document.createElement('div');
                div5.setAttribute('class', 'author');
                div5.setAttribute('style', 'display : inline-block');
                div5.innerText = comentario.autor;
                div4.appendChild(div5);

                var div5 = document.createElement('div');
                div5.setAttribute('class', 'metadata');
                div4.appendChild(div5);

                var div6 = document.createElement('div');
                div6.setAttribute('class', 'date');
                div6.innerText = comentario.data;
                div5.appendChild(div6);

                var div5 = document.createElement('div');
                div5.setAttribute('class', 'text');
                div5.innerText = comentario.texto;
                div4.appendChild(div5);

                var hr = document.createElement('hr');
                $(hr).insertAfter(div3);

                $('#textComment').val('');
            })
        })

        $('#modalDetalhes').modal({
            onHidden: function () {
                $('.ui.rating').rating('disable');
                $(this).html('');
                location.reload();
            },
            onVisible: function () {
                setTimeout(function () {
                    $('.main-carousel').flickity('resize');
                    if (receita.video) {
                        var br = document.createElement('br');
                        imgContainer.appendChild(br);
                        var br = document.createElement('br');
                        imgContainer.appendChild(br);
                        var br = document.createElement('br');
                        imgContainer.appendChild(br);

                        var width = '270px';
                        var element = document.getElementsByClassName('carousel-cell');
                        if (element.length > 0)
                            width = window.getComputedStyle(element[0], null)['width'];

                        var iframe = document.createElement('iframe');
                        iframe.setAttribute('src', receita.video.replace("watch?v=", "embed/"));
                        iframe.setAttribute('width', width);
                        imgContainer.appendChild(iframe);
                    }
                }, 1500)
            }
        }).modal('show');
    });

}

$('#modalDetalhes').on('click', '#buttonExportar', function () {
    var titulo = $('#nomeReceitaXML').text();
    var tempoPrep = $('#tempoReceitaXML').text().substring(18);
    var descricao = $('#descricaoReceitaXML').text();
    var ingredientes = Array.from(document.getElementsByClassName('ingredienteXML'));
    var instrucoes = $('#instrucoesReceitaXML').text();
    var rendimento = $('#rendimentoReceitaXML').text().substring(9);
    var autor = $('#autorReceitaXML').text().substring(7);
    var valorNut = $('#valorNutReceitaXML').text().substring(10);
    var avaliacao = $('#avaliacaoReceitaXML').attr('data-rating');
    var categorias = Array.from(document.getElementsByClassName('categoriaReceita'));

    var xmlDoc = document.implementation.createDocument(null, "cookbook");
    var root = xmlDoc.documentElement;
    root.setAttribute('version', '46');
    var recipe = xmlDoc.createElement('recipe');
    root.appendChild(recipe);
    var title = xmlDoc.createElement("title");
    recipe.appendChild(title);
    var texto = xmlDoc.createTextNode(titulo);
    title.appendChild(texto);

    var totaltime = xmlDoc.createElement('totaltime');
    recipe.appendChild(totaltime);
    texto = xmlDoc.createTextNode(tempoPrep);
    totaltime.appendChild(texto);

    var description = xmlDoc.createElement('description');
    recipe.appendChild(description);
    texto = xmlDoc.createTextNode(descricao);
    description.appendChild(texto);

    var ingredient = xmlDoc.createElement('ingredient');
    recipe.appendChild(ingredient);
    ingredientes.forEach(function (ingrediente) {
        var li = xmlDoc.createElement('li');
        ingredient.appendChild(li);
        texto = xmlDoc.createTextNode(ingrediente.childNodes[0].textContent);
        li.appendChild(texto);
    })

    var recipetext = xmlDoc.createElement('recipetext');
    recipe.appendChild(recipetext);
    texto = xmlDoc.createTextNode(instrucoes);
    recipetext.appendChild(texto);

    //VIDEO

    var quantity = xmlDoc.createElement('quantity');
    recipe.appendChild(quantity);
    texto = xmlDoc.createTextNode(rendimento);
    quantity.appendChild(texto);

    //IMAGEM

    var source = xmlDoc.createElement('source');
    recipe.appendChild(source);
    texto = xmlDoc.createTextNode(autor);
    source.appendChild(texto);

    var nutrition = xmlDoc.createElement('nutrition');
    recipe.appendChild(nutrition);
    texto = xmlDoc.createTextNode(valorNut);
    nutrition.appendChild(texto);

    var rating = xmlDoc.createElement('rating');
    recipe.appendChild(rating);
    texto = xmlDoc.createTextNode(avaliacao);
    rating.appendChild(texto);

    categorias.forEach(function (categoria) {
        var category = xmlDoc.createElement('category');
        recipe.appendChild(category);
        texto = xmlDoc.createTextNode(categoria.childNodes[0].textContent);
        category.appendChild(texto);
    })

    var serializer = new XMLSerializer();
    var xmlString = serializer.serializeToString(xmlDoc);
    var uriContent = "data:application/xml," + encodeURIComponent(xmlString);
    alert("O docuemnto XML pode apresentar problemas para ser renderizado no Google Chrome. Recomenda-se o uso dos browsers Firefox ou Edge para exportar em formato XML!");
    window.open(uriContent);
});

$('#modalDetalhes').on('click', '#buttonImprimir', function () {
    var titulo = $('#nomeReceitaXML').text();
    var tempoPrep = $('#tempoReceitaXML').text();
    var rendimento = $('#rendimentoReceitaXML').text();
    var valorNut = $('#valorNutReceitaXML').text();
    var categorias = Array.from(document.getElementsByClassName('categoriaReceita'));
    var ingredientes = Array.from(document.getElementsByClassName('ingredienteXML'));
    var descricao = $('#descricaoReceitaXML').text();
    var instrucoes = $('#instrucoesReceitaXML').text();

    var myWindow = window.open();
    myWindow.document.title = 'Imprimir - ' + titulo;
    var htmlBody = myWindow.document.body;

    var h1 = document.createElement('h1');
    h1.innerText = titulo;
    htmlBody.appendChild(h1);

    var h6 = document.createElement('h6');
    h6.setAttribute('style', 'margin: 0');
    h6.innerText = tempoPrep;
    htmlBody.appendChild(h6);

    var h6 = document.createElement('h6');
    h6.setAttribute('style', 'margin: 0');
    h6.innerText = rendimento;
    htmlBody.appendChild(h6);

    var h6 = document.createElement('h6');
    h6.setAttribute('style', 'margin: 0');
    h6.innerText = valorNut;
    htmlBody.appendChild(h6);

    var h6 = document.createElement('h6');
    h6.setAttribute('style', 'margin: 0');
    h6.innerText = 'Categoria(s):';
    htmlBody.appendChild(h6);

    categorias.forEach(function (categoria, i) {
        if (i == categorias.length - 1)
            h6.innerText = h6.innerText + ' ' + categoria.childNodes[0].textContent;
        else
            h6.innerText = h6.innerText + ' ' + categoria.childNodes[0].textContent + ',';
    })

    //IMAGEM

    var h3 = document.createElement('h3');
    h3.setAttribute('style', 'margin-bottom: 0');
    h3.innerText = 'Descrição';
    htmlBody.appendChild(h3);

    var p = document.createElement('p');
    p.setAttribute('style', 'margin-top: 0; padding-left: 20px');
    p.innerText = descricao;
    htmlBody.appendChild(p);

    var h3 = document.createElement('h3');
    h3.setAttribute('style', 'margin-bottom: 0');
    h3.innerText = 'Ingredientes';
    htmlBody.appendChild(h3);

    var ul = document.createElement('ul');
    ul.setAttribute('style', 'margin: 0');
    htmlBody.appendChild(ul);

    ingredientes.forEach(function (ingrediente) {
        var li = document.createElement('li');
        li.setAttribute('style', 'padding-left: 20px');
        li.innerText = ingrediente.childNodes[0].textContent;
        htmlBody.appendChild(li);
    });

    var h3 = document.createElement('h3');
    h3.setAttribute('style', 'margin-bottom: 0');
    h3.innerText = 'Instruções';
    htmlBody.appendChild(h3);

    var p = document.createElement('p');
    p.setAttribute('style', 'margin-top: 0; padding-left: 20px');
    p.innerText = instrucoes;
    htmlBody.appendChild(p);
});

$('.header.item#logo').click(function () {
    window.location.href = '../landing_page.html';
});

$('.message .close').on('click', function () {
    $(this)
        .closest('.message')
        .transition('fade');
    setTimeout(function () {
        $('.ui.positive.message').addClass('hidden');
    }, 1000)
    localStorage.removeItem('message');
});

$('.ui.dropdown').dropdown();

$('#buscaReceitasInput').focus(function () {
    firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
        return idToken;
    }).catch(function (error) {
        alert(error);
    }).then(function (token) {
        $('#buscaReceitas').search({
            type: 'standard',
            apiSettings: {
                url: 'https://yummy-18825.firebaseio.com/recipes.json?auth=' + token,
                onResponse: function (recipes) {
                    var response = {
                        results: []
                    };
                    Object.values(recipes).forEach(function (recipe) {
                        if (recipe.nome.toLowerCase().includes($('#buscaReceitasInput').val().toLowerCase())) {
                            response.results.push({
                                title: recipe.nome,
                                id: recipe.id
                            });
                        }
                    });
                    return response;
                }
            },
            onSelect: function (result, response) {
                criarModalDetalhes(result.id);
            }
        });
    });
})


