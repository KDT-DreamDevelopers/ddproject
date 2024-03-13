import dotenv from 'dotenv'
dotenv.config()

function required(key, defaultValue = undefined){
    const value = process.env[key] || defaultValue
    if (value == null){
        throw new Error(`key${key} is undefined`)
    }
    return value
}

export const config = {
    jwt: {
        // jwt 시크릿 키
        secretKey: required('JWT_SECRET'),
        // 만료일자
        expiresInSec: parseInt(required('JWT_EXPIRES_SEC', 172800))
    },
    bcrypt: {
        // salt 반복 횟수
        saltRounds: parseInt(required('BCRYPT_SALT_ROUND',12))
    },
    host: {
        port: parseInt(required('HOST_PORT', 8080))
    },
    // DB 개인정보
    db: {
        host: required('DB_HOST')
    },
    // sms 개인정보
    sms : {
        apiKey: required('API_KEY'),
        apiSecret: required('API_SECERET'),
        fromNum: required('FROM_NUMBER')
    }
}