export default {
    TYPE :{
        SUCCESS :'success',
        ERROR :'error'

    },

    SUCCESS_CODE: {
       TITLE : '저장 완료',
        TEXT : '저장이 완료되었습니다.',
    },
    CREATE_USER: {
        TITLE : '회원가입 완료',
        TEXT: '회원가입이 완료되었습니다. 관리자의 승인 이후 로그인이 가능합니다'
    },

    CREATE_USER_FAIL :{
        TITLE :'회원가입 실패',
        TEXT:'회원가입이 실패하였습니다.',
    },

    ERROR_CODE: {
        LOGIN_LOCKED: {
            TITLE: 'LOGIN_LOCKED',
            TEXT: '로그인이 잠김되었습니다.',
        },
        FORBIDDEN: {
            //"403": // Forbidden
            TITLE: 'FORBIDDEN',
            TEXT: '권한이 없습니다.',
        },
        UNAUTHORIZED: {
            // "401": // Unauthorized
            TITLE: 'UNAUTHORIZED',
            TEXT: '허가되지 않았습니다.',
        },
        BUSINESS_EXCEPTION: {
            //"400": // Bad Request
            TITLE: ' BUSINESS_EXCEPTION',
            TEXT: '프로세스 오류입니다.',
        },
        EXSEPTION_ERROR: {
            TITLE: 'EXSEPTION_ERROR',
            TEXT: '',
        },
        SERVER_NOT_RESPONDED: {
            // "504": // Gateway Timeout
            TITLE: 'SERVER_NOT_RESPONDED',
            TEXT: '서버 응답시간이 제한을 초과하였습니다.',
        },
        INTERNAL_SERVER_ERROR: {
            //"500": // Internal Server ERROR
            TITLE: 'INTERNAL_SERVER_ERROR',
            TEXT: '서버가 응답하지 않습니다.',
        }

    }
};
