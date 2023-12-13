import MongoDb from 'mongodb'
import express from 'express'
import { config } from '../config.js'
import { getInquiries, getUsers } from '../db/database.js'
import * as authRepository from '../data/auth.js'
import { Result } from 'express-validator'

const ObjectID = MongoDb.ObjectId

export async function create(category, title, text, userId){
    return authRepository.getById(userId)
    .then((user)=>
        getInquiries().insertOne({
            category,
            title,
            text,
            userid: user.userid,
            createdAt: new Date()
        })
    )
    .then((result)=> getById(result.insertedId))
    .then(mapOptionalInquiry)
}

// _id로 문의 데이터 찾기
export async function getById(id) {
    return getInquiries()
        .find({_id: new ObjectID(id)})
        .next()
        .then(mapOptionalInquiry)
}

// userid로 문의 데이터 찾기
export async function getAllByUserid(userid){
    return getInquiries()
        .find({userid})
        .toArray()
        .then(mapInquiries)
}

// update()  문의 글 수정    수정 못하게 하기로함....
// export async function update(id, category, title, text){
//     return getInquiries().findOneAndUpdate(
//         {_id: new ObjectID(id)},
//         {$set: {category, title, text,}},
//         {returnDocument: "after"}
//     )
// }

// delete()   문의 글 삭제 
export async function remove(id) {
    return getInquiries().deleteOne({_id: new ObjectID(id)})
}

// _id 값 가져오는 함수
function mapOptionalInquiry(inquiry){
    return inquiry? {...inquiry, id: inquiry._id.toString()} : inquiry;
}

function mapInquiries(inquiries){
    return inquiries.map(mapOptionalInquiry)
}
