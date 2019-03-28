// 'use strict';

const Controller = require('egg').Controller;
const random = require('../util/random');
const path=require('path');
const fs=require('fs');
class UserController extends Controller {
    // 用户登录注册
async index() {
    const _ctx=this.ctx;
    const {nickName,gender,avatarUrl,openid}=_ctx.request.body;
    const user=await _ctx.model.User.findAll(
        {
            where:{
                openid:openid
            }
        }
    );
    var data;
    if(user.length==0){
        var uid=random.getRandomString(8);
        var res=await _ctx.model.User.create({
        uid:uid,
        nickname:nickName,
        sex:gender,
        headimg:avatarUrl,
        openid:openid,
        money:1000
        })
        if(res){
            // mkdirSync()用来生成文件夹
            if(! fs.existsSync())fs.mkdirSync(path.join(this.config.baseDir,'app/public',uid));
            if(! fs.existsSync())fs.mkdirSync(path.join(this.config.baseDir,'app/public/'+uid,'beat'));
            if(! fs.existsSync())fs.mkdirSync(path.join(this.config.baseDir,'app/public/'+uid,'project'));
            if(! fs.existsSync())fs.mkdirSync(path.join(this.config.baseDir,'app/public/'+uid,'forum'));
            if(! fs.existsSync())fs.mkdirSync(path.join(this.config.baseDir,'app/public/'+uid,'img'));
            data=res;
        }
    }
    else{
        data=user;
    }
    _ctx.body ={
        code:200,
        data:data
    };
}
// 修改个人信息
async updateuserinfo(){
    let ctx = this.ctx;
    let {data}=ctx.request.body;
    console.log("ccccccc",data);
let info =await ctx.model.User.update(data.data, {
                where:{uid: data.uid}
            })
        console.log("bbbbbbb",info);

    ctx.body = {
        code:200,
        data:info
    }; 
} 
// 查询个人信息 主页
async showMyInfo(){
    const ctx = this.ctx;
    const {data}=ctx.request.body;
    let info=await ctx.model.User.findAll
    ({where:data}).then(us =>us.map(u => u.toJSON()));
    info.map((item)=>{
        if(item.headimg.indexOf("https")==-1)
        item.imgurl=fs.readdirSync('app/'+item.headimg);
        else
        item.imgurl=''
    })
    ctx.body ={
        code:200,
        data:{info}
    };
}
// 获取关注的人数
async getfollownum(){
    let ctx = this.ctx;
    let {data}=ctx.request.body;
    let sequelize=this.app.Sequelize;

        let fnum=await ctx.model.Follow.findAll({
            where:data,
            attributes: [ [sequelize.fn('COUNT', sequelize.col('uid')), 'num']]
        }).then(us =>us.map(u => u.toJSON()));
        // 获取粉丝数
        let fans=await ctx.model.Fans.findAll({
            where:data,
            attributes: [ [sequelize.fn('COUNT', sequelize.col('uid')), 'fans']]
        }).then(us =>us.map(u => u.toJSON()));

        let user=await ctx.model.User.findOne({where:data}).then(us =>us.toJSON());
        let money=user.money
    ctx.body ={
        code:200,
        data:{fnum,fans,money}
    };
}
// 获取某个人的信息
async getperson(){
    let ctx = this.ctx;
    let {data}=ctx.request.body;

    let user=await ctx.model.User.findOne({where:data}).then(us =>us.toJSON());
    ctx.body ={
        code:200,
        data:user
    };
}
// 获取关注和粉丝列表
async getFollowList(){
    let ctx = this.ctx;
    let {data}=ctx.request.body;

    let model;
    if(data.type=='follow') model=ctx.model.Follow;
    else model=ctx.model.Fans;
    let list=await model.findAll({
        where:data.uid,
        include: [{model: ctx.app.model.User}]
    }).then(us =>us.map(u => u.toJSON()));
    list.map((item)=>{
        if(item.headimg.indexOf("https")==-1)
        item.User.imgurl=fs.readdirSync('app/'+item.User.headimg);
        else
        item.User.imgurl=''
    })
    ctx.body ={
        code:200,
        data:{list}
    };
}
// 推荐模特或推荐摄影师
async FilterInfo(){
    const ctx = this.ctx;
    let Op = this.app.Sequelize.Op;
    let {data}=ctx.request.body;
    let data1={};
    if(data.area){
        if(data.area!='地区')
        data1.address={
            // 模糊查询
            [Op.like]:'%' +data.area + '%'
            }
        if(data.sex!='性别')
        data1.sex=data.sex;
        data1.role=data.role;
        data1.uid={
            $ne: 'e3fe6790469ed968'
        }
    }else{
        data1={
            role:data.role,
            uid:{
                $ne: 'e3fe6790469ed968'
            }
        }
    }
    const filterresult=await ctx.model.User.findAll
    ({where:data1}).then(us =>us.map(u => u.toJSON()));
    filterresult.map((item)=>{
        item.imgurl=fs.readdirSync('app/'+item.headimg);
    })
    ctx.body ={
        code:200,
        data:filterresult
    };
}
// 查找管理员账号是否存在
async getadmin() {
    let ctx=this.ctx;
    // 打印ajax.post data参数
    let adminid = await ctx.query.adminid;
    let admin=await ctx.model.Admin.findOne({where:{adminid:adminid}});
    ctx.body ={
        code:200,
        data:admin
    };
}

// 注册为管理员
async addadmin() {
    let ctx=this.ctx;
    let data = await ctx.query;
    var res=await ctx.model.Admin.create(data);
    ctx.body ={
        code:200,
        data:res
    };
}
    // 获取平台上的所有用户
    async queryUser(){
        let ctx=this.ctx;
        let users=await ctx.model.User.findAll
        ().then(us =>us.map(u => u.toJSON()));
        ctx.body ={
            code:200,
            data:users
        };
    }

}

module.exports = UserController;