var $q = require('q'),
    agent = require('superagent'),
    cheerio = require('cheerio');

module.exports = {

    sites:[
        {
            name:'Caller Notes',
            url:'http://callernotes.org/phonenumber/{{num}}',
            selector:'div.maincomment',
            defaultComment:'has anyone gotten a sms or phonecall from this telephone number? can you please tell me who it was or what happened. thanks'
        },
        {
            name:'Tellows',
            url:'http://www.tellows.co.uk/num/{{num}}',
            selector:'div.comment-body > p'
        },
        {
            name:'Should I Answer',
            url:'http://www.shouldianswer.co.uk/phone-number/{{num}}',
            selector:'article.review.container div.container > span[itemprop="description"]',
            defaultComment:'This number doesn\'t have any negative ratings. We also haven\'t detected any unusual activity regarding number'
        },
            // {
            //     name:'This Phone',
            //     url:'http://thisphone.co.uk/{{num}}',
            //     selector:'#container-masonry .itemmasonry p:first-child'
            // },
        {
            name:'Bad Numbers',
            numberAdapter:function(num) {
                return [num.slice(0,5),'-',num.slice(5)].join('');
            },
            url:'http://www.badnumbers.co.uk/{{num}}',
            selector:'#output div:not(:first-child) font > font[size="3"]'
        },
        {
            name:'Who Calls Me',
            url:'http://whocallsme.com/Phone-Number.aspx/{{num}}',
            selector:'div.oos_p6'
        },
        {
            name:'Who Called',
            url:'http://who-called.co.uk/Number/{{num}}',
            selector:'div.leftTitle + table tbody tr p.numberDescShort'
        },
        {
            name:'Telepest',
            url:'http://www.telepest.co.uk/{{num}}',
            selector:'noscript > div p:first-child'
        },
        {
            name:'Unknown Phone',
            url:'http://www.unknownphone.com/search.php?num={{num}}',
            selector:'.comment_text'
        }
    ],

    exec:function(num) {

        var q = $q.defer(),
            requestPromises = [];

        module.exports.sites.forEach(function(site) {

            var q = $q.defer();
            requestPromises.push(q.promise);

            var lookupNum = site.numberAdapter ? site.numberAdapter(num) : num;

            console.log(site.url.replace('{{num}}', lookupNum));

            agent
                .get(site.url.replace('{{num}}', lookupNum))
                .end(function(err,response) {
                    if (err) {
                        console.log(err);
                        return q.resolve([]);
                    }

                    var $ = cheerio.load(response.text),
                        comments = $(site.selector).map(function() {
                            return $(this).text().trim();
                        }).get().filter(function(comment) {
                            return comment !== '' && (site.defaultComment ? comment.slice(0,site.defaultComment.length) !== site.defaultComment : true);
                        });

                    site.comments = comments;
                    q.resolve(site);

                });

            setTimeout(function() {
                site.comments = [];
                q.resolve(site)
            }, 5000);

        });

        $q.all(requestPromises).then(function(comments) {
            q.resolve(comments);
        });

        return q.promise;

    }

};
