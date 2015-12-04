var express = require('express'),
    app = express(),
    thing = require('./api/controllers/GetComments'),
    commonWords = require('./api/models/CommonWords'),
    expresshb = require('express-handlebars');

process.chdir(__dirname+'/api/');

var hbs = expresshb.create({
    defaultLayout:'main',
    // layoutsDir:[
    //     __dirname+'/api/views'
    // ],
    // partialsDir:[
    //     __dirname+'/api/views'
    // ],
    extname:'.html'
});
hbs.layoutsDir = __dirname+'/api/views';

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

function responseHandler(req,res) {
    var num = req.params.num || '';

    if (!num) return res.render('index');

    console.log('NUM>>>',num);

    thing.exec(num).then(function(resolves) {

        res.render('index');

        console.log(resolves);

        var wordCounts = {},
            words = resolves.map(function(resolve) {
                return resolve.comments.join(' ').trim().toLowerCase();
            }).join(' ').trim().split(/\b/);

        for (var i=0;i<words.length;i++) wordCounts['_' + words[i]] = (wordCounts['_' + words[i]] || 0) + 1;

        var sortable = [];
        for (var word in wordCounts) sortable.push([word, wordCounts[word]]);

        var top = sortable.sort(function(a,b) {
            return b[1] - a[1];
        }).map(function(count) {
            return [count[0].slice(1).trim(), count[1]];
        }).filter(function(word) {
            return commonWords.indexOf(word[0]) === -1 && word[1] > 1 && word[0].length >= 2;
        });

        console.log(top);
        return;

    });
}

app.use('/:num', responseHandler);
app.get('/*', responseHandler);

console.log(hbs);

// var num = '01332387201';
// num = '07874431615';
// num = '01442894259';
// num = '02078031700';
// num = '02079361100';
// num = '02079525737';
// num = '02072531054';
// num = '02075327976';
// num = '02075363589';
// num = '07816411378';
// num = '08005610170';

// require('q').all([
//         thing.callernotes(num),
//         // thing.tellows(num),
//         // thing.shouldianswer(num),
//         // thing.thisphone(num)
//         //thing.badnumbers(num)
//         //thing.whocallsme(num)
//         //thing.whocalled(num)
//         //thing.telepest(num)
//         //thing.unknownphone(num)
//     ]).then(function() {
//     console.log('RESPONSES',arguments);
// });

//app.get('/')

// thing.exec(num).then(function(resolves) {
//     var wordCounts = {},
//         words = resolves.map(function(resolve) {
//             return resolve.comments.join(' ').trim().toLowerCase();
//         }).join(' ').trim().split(/\b/);

//     for (var i=0;i<words.length;i++) wordCounts['_' + words[i]] = (wordCounts['_' + words[i]] || 0) + 1;

//     var sortable = [];
//     for (var word in wordCounts) sortable.push([word, wordCounts[word]]);

//     var top = sortable.sort(function(a,b) {
//         return b[1] - a[1];
//     }).map(function(count) {
//         return [count[0].slice(1).trim(), count[1]];
//     }).filter(function(word) {
//         return commonWords.indexOf(word[0]) === -1 && word[1] > 1 && word[0].length >= 2;
//     });

//     console.log(top);

// });

var server = app.listen(3000, function() {
    console.log('Example app listening at http://%s:%s', server.address().host, server.address().port);
});
