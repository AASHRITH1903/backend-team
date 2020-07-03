const router = require('express').Router()
const {upload}= require('../db/upload')
const clubMemberModel = require('../models/ClubMember.model')
const clubAuth = require('../middleware/clubAuth')

// for rendering the create club members page
router.route('/create/').get(clubAuth, (req, res) => {
    res.render('create_club_member')
})

// route to create the club members
router.route('/create').post(clubAuth, upload.single('dp') ,async  (req, res) => {
    let dpurl = "";

    if (req.file != undefined) {
        dpurl = req.file.filename
    }
    
    const updates = Object.keys(req.body)

    try{

        let member = {}

        updates.forEach((update) => {
        member[update] = req.body[update]
        })
        member["dp_url"] = dpurl

        const club_member = new clubMemberModel(member)

        clubMemberModel.update({_id:req.user.id},{$push:{members:club_member}})

        res.redirect('/club_members/view_all')
    }catch(e){
        res.status(400).json(e)
    }

})

// for rendering the club member update page
router.route('/update/:id').get(clubAuth, async (req, res) => {
    const member_id = req.params.id
    let member;
    try {
        member = clubMemberModel.findOne({owner:req.user._id,"members._id":member_id})
        res.render('update_club_member',{member:member})
    } catch (error) {
        res.json(error)
    }
    res.redirect('update_club_member')
})

// route to update the club member details
router.route('/update/:id').post(clubAuth, upload.single('dp') ,async (req, res) => {

    const member_id = req.params.id

    let dpurl = req.body.dp_url;

    if (req.file != undefined) {
        dpurl = req.file.filename
    }
    
    const updates = Object.keys(req.body)

    try{

        let member = {}

        updates.forEach((update) => {
        member[update] = req.body[update]
        })
        member["dp_url"] = dpurl

        await clubMemberModel.findOneAndUpdate({owner:req.user._id,"members._id":member_id},{member})

        res.redirect('/club_members/view_all')
    }catch(e){
        res.status(400).json(e)
    }

})

// route to delete club members
router.route('/delete/:id').delete(clubAuth, async (req, res) => {
    const member_id = req.params.id;
    try {
        await clubMemberModel.findByIdAndDelete(member_id)
        res.redirect('/club_members/view_all')
    } catch (error) {
        res.json(error)        
    }
})

// for rendering view page of all club members
router.route('/view_all').get(clubAuth, async (req, res) => {
    let club_members;
    try {
        club_members = await clubMemberModel.findOne({owner:req.user._id})
        res.render('view_club_members',{members:club_members.members})
    } catch (error) {
        res.json(error)
    }
})


module.exports = router
