const router = require('express').Router()
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit();
const _ = require('lodash');

router.route('/:target').get( async(req, res) => {
    const param = req.params.target=="frontend"?{owner: 'mir-sam-ali',repo: 'frontend-team'}:{owner: 'shobhi1310',repo: 'backend-team'}
    const response=await octokit.request('GET /repos/{owner}/{repo}/stats/contributors',param)
    const datam=response.data;
    const filtered = datam.map((data) => ({
        id:_.get(data,'author.login'),
        img: _.get(data, 'author.avatar_url'),
        url:_.get(data, 'author.html_url'),
        ..._.pick(data, 'total')
    }));
    const winners = datam.map((data) => ({
        id:_.get(data,'author.login'),
        img: _.get(data, 'author.avatar_url'),
        url:_.get(data, 'author.html_url'),
        weekly: _.last(_.sortBy(_.get(data, 'weeks'),'w'))
    }));
    var winner,reZero=0,total_c=0;
    const latestData=winners[0]["weekly"].w
    datam.forEach(element => {
        element['weeks'].forEach(week=>{
            if(week.w==latestData)
            total_c=total_c+week.c
        })
    });
    total_c=total_c/10
    winner = _.orderBy(winners, function(e) {let score=(e["weekly"].a * Math.ceil((e["weekly"].c)/total_c)); if(score!=0)reZero=reZero+1; return score}, ['desc']).slice(0,3);
    if(reZero<3)
    winner = _.orderBy(winners, function(e) {return e["weekly"].c}, ['desc']).slice(0,3);
    const result = _.orderBy(filtered, ['total'],['desc']);
    res.render('contributors', { authors:result,winners:winner,total_c:total_c })
})

module.exports = router
