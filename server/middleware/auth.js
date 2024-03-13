import jwt from 'jsonwebtoken'
import * as authRepository from '../data/auth.js'
import {config} from '../config.js'

const AUTH_ERROR = {message: '인증 에러!'}

export const isAuth = async(req, res, next)=>{
    const authHeader = req.get('Authorization')

    if (!(authHeader && authHeader.startsWith('Bearer '))){
        return res.status(401).json(AUTH_ERROR)
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(
        token, config.jwt.secretKey, async (error, decoded)=>{
            if (error){
                return res.status(403).json(AUTH_ERROR)
            }
            const user = await authRepository.getById(decoded.id)
            if (!user){
                return res.status(402).json(AUTH_ERROR)
            }
            req.userId = user.id
            next()
        }
    )
}