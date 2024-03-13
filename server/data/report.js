import MongoDb from 'mongodb'
import express from 'express'
import { config } from '../config.js'
import { getReports, getUsers } from '../db/database.js'
import * as authRepository from '../data/auth.js'

const ObjectID = MongoDb.ObjectId

// create()  불편신고글 생성
export async function create(location, text, filename, userId){
    return authRepository.getById(userId)
    .then((user)=>
        getReports().insertOne({
            location,
            text,
            userid: user.userid,
            createdAt: new Date(),
            img: filename,
            check: ''
        })
    )
    .then((result)=> getById(result.insertedId))
    .then(mapOptionalReport)
}

// _id로 불편신고 데이터 찾기
export async function getById(id) {
    return getReports()
        .find({_id: new ObjectID(id)})
        .next()
        .then(mapOptionalReport)
}

// getAll()       불편신고 글 전부 불러오기
export async function getAll(){
    return getReports()
        .find()
        .toArray()
        .then(mapReports)
}

// checkOk()   불편신고 check: ok 로 변경
export async function checkOk(id){
    return getReports().findOneAndUpdate(
        {_id: new ObjectID(id)},
        {$set: {check: '✅'}},
        {returnDocument: "after"}
    )
} 

// remove()   문의 글 삭제 
export async function remove(id) {
    return getReports().deleteOne({_id: new ObjectID(id)})
}

// _id 값 가져오는 함수
function mapOptionalReport(report){
    return report? {...report, id: report._id.toString()} : report;
}

function mapReports(reports){
    return reports.map(mapOptionalReport)
}