import MongoDb from 'mongodb'
import express from 'express'
import { config } from '../config.js'
import { getInquiries, getUsers } from '../db/database.js'
import * as authRepository from '../data/auth.js'
import { Result } from 'express-validator'

const ObjectID = MongoDb.ObjectId

export async function create(category, title, text, answer, userId){
    return authRepository.getById(userId)
    .then((user)=>
        getInquiries().insertOne({
            category,
            title,
            text,
            userid: user.userid,
            createdAt: new Date(),
            answer: ""
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

// ---------------------------------------------------
// 관리자 페이지

// answer()  문의 글에 답변하기
export async function answer(id, answer) {
    try {
        const objectId = new ObjectID(id);
        const result = await getInquiries().findOneAndUpdate(
            { _id: objectId },
            { $set: { answer } },
            { returnDocument: "after" }
        );

        return result;
    } catch (error) {
        console.error('Error updating document:', error);
        throw error; 
    }
}

// 모든 문의 내역
export async function allInquiry() {
    return getInquiries()
        .find()
        .sort({ createdAt: -1 })
        .toArray()
        .then(mapInquiries);
}